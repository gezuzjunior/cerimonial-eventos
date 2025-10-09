// Tipos para o sistema Cerimonial Fácil

export interface Autoridade {
  id: string;
  nome: string;
  cargo: string;
  orgao: string;
  nivelFederativo: 'Federal' | 'Estadual' | 'Municipal';
  precedencia: number;
  presente: boolean;
  incluirDispositivo: boolean;
  incluirFalas: boolean;
  ordemFala: number;
  observacoes?: string;
}

export interface EventoCerimonial {
  id: string;
  nome: string;
  data: string;
  local: string;
  autoridades: Autoridade[];
  logoUrl?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  usuario: string;
  isAdmin: boolean;
}

export interface ConfiguracaoSistema {
  fontesOficiais: {
    congressoNacional: string;
    senadoFederal: string;
    governoMT: string;
  };
  ultimaAtualizacao: string;
  versao: string;
}

// Enums para facilitar o uso
export enum NivelFederativo {
  FEDERAL = 'Federal',
  ESTADUAL = 'Estadual',
  MUNICIPAL = 'Municipal'
}

export enum StatusPresenca {
  AUSENTE = 'ausente',
  PRESENTE = 'presente',
  CONFIRMADO = 'confirmado'
}

// Tipos para precedência baseados no Decreto nº 70.274/1972
export interface RegrasPrecedencia {
  cargo: string;
  nivel: NivelFederativo;
  ordem: number;
  observacoes?: string;
}

export const PRECEDENCIAS_OFICIAIS: RegrasPrecedencia[] = [
  { cargo: 'Presidente da República', nivel: NivelFederativo.FEDERAL, ordem: 1 },
  { cargo: 'Vice-Presidente da República', nivel: NivelFederativo.FEDERAL, ordem: 2 },
  { cargo: 'Presidente do Senado Federal', nivel: NivelFederativo.FEDERAL, ordem: 3 },
  { cargo: 'Presidente da Câmara dos Deputados', nivel: NivelFederativo.FEDERAL, ordem: 4 },
  { cargo: 'Presidente do Supremo Tribunal Federal', nivel: NivelFederativo.FEDERAL, ordem: 5 },
  { cargo: 'Governador do Estado', nivel: NivelFederativo.ESTADUAL, ordem: 6 },
  { cargo: 'Vice-Governador do Estado', nivel: NivelFederativo.ESTADUAL, ordem: 7 },
  { cargo: 'Senador da República', nivel: NivelFederativo.FEDERAL, ordem: 8 },
  { cargo: 'Deputado Federal', nivel: NivelFederativo.FEDERAL, ordem: 9 },
  { cargo: 'Ministro de Estado', nivel: NivelFederativo.FEDERAL, ordem: 10 },
  { cargo: 'Presidente da Assembleia Legislativa', nivel: NivelFederativo.ESTADUAL, ordem: 11 },
  { cargo: 'Desembargador', nivel: NivelFederativo.ESTADUAL, ordem: 12 },
  { cargo: 'Secretário de Estado', nivel: NivelFederativo.ESTADUAL, ordem: 13 },
  { cargo: 'Deputado Estadual', nivel: NivelFederativo.ESTADUAL, ordem: 14 },
  { cargo: 'Prefeito Municipal', nivel: NivelFederativo.MUNICIPAL, ordem: 15 },
  { cargo: 'Vice-Prefeito Municipal', nivel: NivelFederativo.MUNICIPAL, ordem: 16 },
  { cargo: 'Presidente da Câmara Municipal', nivel: NivelFederativo.MUNICIPAL, ordem: 17 },
  { cargo: 'Vereador', nivel: NivelFederativo.MUNICIPAL, ordem: 18 },
  { cargo: 'Secretário Municipal', nivel: NivelFederativo.MUNICIPAL, ordem: 19 }
];