// ==========================================
// FUNÇÕES AUXILIARES DE FORMATAÇÃO
// ==========================================

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short'
});

// Formata horas automaticamente (00:00)
export const formatHoras = (value) => {
  if (!value) return '';
  const strValue = String(value);
  const [h = '0', m = '00'] = strValue.split(':');
  const cleanH = h.replace(/\D/g, '') || '0';
  const cleanM = m.replace(/\D/g, '').substring(0, 2).padStart(2, '0');
  return `${cleanH}:${cleanM}`;
};

// Auto-correção Inteligente de Nome (Trim + Remove espaços duplos + MAIÚSCULAS + Normalização)
export const formatarNome = (nome) => {
  if (!nome) return '';
  return String(nome)
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
};

// Exibição amigável do timestamp do Firebase
export const formatarDataEnvio = (report) => {
  let dataStr = '--';
  if (report.dataEnvio) {
    try {
      if (typeof report.dataEnvio === 'string') {
        dataStr = report.dataEnvio;
      } else {
        let dateObj = null;
        if (report.dataEnvio instanceof Date) {
          dateObj = report.dataEnvio;
        } else if (report.dataEnvio.seconds) {
          dateObj = new Date(report.dataEnvio.seconds * 1000);
        } else if (typeof report.dataEnvio.toDate === 'function') {
          dateObj = report.dataEnvio.toDate();
        }
        
        if (dateObj && !isNaN(dateObj.getTime())) {
          dataStr = dateFormatter.format(dateObj);
        }
      }
    } catch (e) {
      console.error("Erro na formatação de data:", e);
    }
  }
  
  if (report.enviadoPorAdmin && !dataStr.includes('Secretário')) {
    dataStr += ' (Secretário)';
  }
  
  return dataStr;
};