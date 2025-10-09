import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Autoridade, PRECEDENCIAS_OFICIAIS, NivelFederativo } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para determinar precedência automática baseada no cargo
export function determinarPrecedencia(cargo: string, nivelFederativo: NivelFederativo): number {
  const regra = PRECEDENCIAS_OFICIAIS.find(p => 
    p.cargo.toLowerCase().includes(cargo.toLowerCase()) && 
    p.nivel === nivelFederativo
  );
  
  return regra ? regra.ordem : 999; // Se não encontrar, coloca no final
}

// Função para ordenar autoridades por precedência
export function ordenarPorPrecedencia(autoridades: Autoridade[]): Autoridade[] {
  return [...autoridades].sort((a, b) => a.precedencia - b.precedencia);
}

// Função para ordenar falas (ordem inversa de precedência)
export function ordenarFalas(autoridades: Autoridade[]): Autoridade[] {
  return [...autoridades].sort((a, b) => b.precedencia - a.precedencia);
}

// Função para validar dados de autoridade
export function validarAutoridade(autoridade: Partial<Autoridade>): string[] {
  const erros: string[] = [];
  
  if (!autoridade.nome?.trim()) {
    erros.push('Nome é obrigatório');
  }
  
  if (!autoridade.cargo?.trim()) {
    erros.push('Cargo é obrigatório');
  }
  
  if (!autoridade.orgao?.trim()) {
    erros.push('Órgão é obrigatório');
  }
  
  if (!autoridade.nivelFederativo) {
    erros.push('Nível federativo é obrigatório');
  }
  
  return erros;
}

// Função para gerar ID único
export function gerarId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Função para formatar nome (primeira letra maiúscula)
export function formatarNome(nome: string): string {
  return nome
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
}

// Função para salvar dados no localStorage
export function salvarDadosLocais(chave: string, dados: any): void {
  try {
    localStorage.setItem(chave, JSON.stringify(dados));
  } catch (error) {
    console.error('Erro ao salvar dados locais:', error);
  }
}

// Função para carregar dados do localStorage
export function carregarDadosLocais<T>(chave: string, valorPadrao: T): T {
  try {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : valorPadrao;
  } catch (error) {
    console.error('Erro ao carregar dados locais:', error);
    return valorPadrao;
  }
}

// Função para exportar lista de autoridades
export function exportarAutoridades(autoridades: Autoridade[]): string {
  const cabecalho = 'Nome,Cargo,Órgão,Nível,Precedência,Presente,Dispositivo,Falas\n';
  const linhas = autoridades.map(a => 
    `"${a.nome}","${a.cargo}","${a.orgao}","${a.nivelFederativo}",${a.precedencia},${a.presente ? 'Sim' : 'Não'},${a.incluirDispositivo ? 'Sim' : 'Não'},${a.incluirFalas ? 'Sim' : 'Não'}`
  ).join('\n');
  
  return cabecalho + linhas;
}

// Função para simular busca em fontes oficiais
export async function buscarAutoridadesOficiais(): Promise<Autoridade[]> {
  // Simulação de busca - em produção, faria requisições reais
  return new Promise((resolve) => {
    setTimeout(() => {
      const autoridadesSimuladas: Autoridade[] = [
        {
          id: gerarId(),
          nome: "Mauro Mendes Ferreira",
          cargo: "Governador do Estado",
          orgao: "Governo do Estado de Mato Grosso",
          nivelFederativo: NivelFederativo.ESTADUAL,
          precedencia: 6,
          presente: false,
          incluirDispositivo: false,
          incluirFalas: false,
          ordemFala: 0
        },
        {
          id: gerarId(),
          nome: "Otaviano Olavo Pivetta",
          cargo: "Vice-Governador do Estado",
          orgao: "Governo do Estado de Mato Grosso",
          nivelFederativo: NivelFederativo.ESTADUAL,
          precedencia: 7,
          presente: false,
          incluirDispositivo: false,
          incluirFalas: false,
          ordemFala: 0
        }
      ];
      
      resolve(autoridadesSimuladas);
    }, 1000);
  });
}

// Função para verificar se está online
export function estaOnline(): boolean {
  return navigator.onLine;
}

// Função para formatar data
export function formatarData(data: Date): string {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Constantes do sistema
export const CONFIGURACOES = {
  VERSAO: '1.0.0',
  NOME_APP: 'Cerimonial Fácil',
  ORGAO: 'Governo do Estado de Mato Grosso',
  CHAVES_LOCALSTORAGE: {
    AUTORIDADES: 'cerimonial_autoridades',
    CONFIGURACOES: 'cerimonial_config',
    USUARIO: 'cerimonial_usuario'
  },
  FONTES_OFICIAIS: {
    CONGRESSO: 'https://www.congressonacional.leg.br',
    SENADO: 'https://www25.senado.leg.br',
    GOVERNO_MT: 'https://www.mt.gov.br'
  }
};