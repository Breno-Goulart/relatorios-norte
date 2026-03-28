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
  if (strValue.includes(':')) {
    const [h, m] = strValue.split(':');
    const cleanH = h.replace(/\D/g, '');
    const cleanM = m.replace(/\D/g, '');
    if (cleanM.length > 2) {
      const combined = cleanH + cleanM;
      return `${combined.slice(0, -2)}:${combined.slice(-2)}`;
    }
    return cleanM ? `${cleanH}:${cleanM}` : `${cleanH}:`;
  }
  const cleanValue = strValue.replace(/\D/g, '');
  if (cleanValue.length > 2) {
    return `${cleanValue.slice(0, -2)}:${cleanValue.slice(-2)}`;
  }
  return cleanValue;
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
      } else if (report.dataEnvio instanceof Date) {
        dataStr = dateFormatter.format(report.dataEnvio);
      } else if (report.dataEnvio.seconds) {
        dataStr = dateFormatter.format(new Date(report.dataEnvio.seconds * 1000));
      } else if (typeof report.dataEnvio.toDate === 'function') {
        dataStr = dateFormatter.format(report.dataEnvio.toDate());
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