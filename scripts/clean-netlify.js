import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import pLimit from 'p-limit';

// Carrega as variáveis do .env
dotenv.config();

// Puxa o token que criamos na Etapa 1
const TOKEN = process.env.NETLIFY_PERSONAL_TOKEN;
const isForce = process.argv.includes('--force');

const NETLIFY_API = 'https://api.netlify.com/api/v1';
const CONCURRENCY_LIMIT = 3; // Limita a 3 exclusões por vez para evitar bloqueio da API

const api = axios.create({
  baseURL: NETLIFY_API,
  headers: { Authorization: `Bearer ${TOKEN}` }
});

async function run() {
  console.log('🧹 Iniciando limpeza de deploys antigos do Netlify...');

  if (!TOKEN) {
    console.error('❌ ERRO: Variável NETLIFY_PERSONAL_TOKEN não encontrada no .env');
    process.exit(1);
  }

  // Detecta automaticamente qual é o projeto (siteId) via ENV ou pasta local
  let siteId = process.env.NETLIFY_SITE_ID;

  if (!siteId) {
    const statePath = path.resolve(process.cwd(), '.netlify', 'state.json');
    if (!fs.existsSync(statePath)) {
      console.error('❌ ERRO: NETLIFY_SITE_ID não definido e .netlify/state.json não encontrado.');
      console.log('💡 DICA: Defina a ENV ou execute "npx netlify link" no terminal.');
      process.exit(1);
    }
    const stateInfo = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    siteId = stateInfo.siteId;
  }

  try {
    console.log(`🔍 Buscando informações do site...`);
    const { data: siteData } = await api.get(`/sites/${siteId}`);
    const publishedDeployId = siteData.published_deploy?.id;

    if (!publishedDeployId) {
      console.error('⚠️ Nenhum deploy publicado encontrado. Operação abortada por segurança.');
      process.exit(1);
    }
    console.log(`✅ Deploy de produção atual protegido (ID: ${publishedDeployId})`);

    console.log('📦 Buscando histórico de deploys...');
    const { data: deploys } = await api.get(`/sites/${siteId}/deploys`);
    
    // Filtra os deploys: mantém apenas os que NÃO são o de produção
    const deploysToDelete = deploys.filter(d => d.id !== publishedDeployId);

    if (deploysToDelete.length === 0) {
      console.log('✨ O projeto já está limpo. Nenhum deploy antigo para remover.');
      return;
    }

    console.log(`🗑️ Encontrados ${deploysToDelete.length} deploys antigos para remover.`);

    // Trava de segurança: se não rodar com --force, ele só mostra o que faria
    if (!isForce) {
      console.log('⚠️ MODO DE SIMULAÇÃO: Nenhum arquivo foi apagado.');
      console.log('💡 Para apagar de verdade, o comando deve ter a flag --force');
      return;
    }

    console.log('🚀 Iniciando exclusão...');
    const limit = pLimit(CONCURRENCY_LIMIT);
    const deletePromises = deploysToDelete.map(deploy => 
      limit(async () => {
        try {
          await api.delete(`/sites/${siteId}/deploys/${deploy.id}`);
          console.log(`  ✅ Deletado: ${deploy.id}`);
        } catch (err) {
          console.error(`  ❌ Falha ao deletar ${deploy.id}:`, err.response?.data?.message || err.message);
        }
      })
    );

    await Promise.all(deletePromises);
    console.log('🎉 Limpeza concluída com sucesso!');

  } catch (error) {
    console.error('❌ ERRO FATAL na comunicação com a API do Netlify:');
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

run();