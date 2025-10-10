import { createClient } from '@supabase/supabase-js';

// Configuração com fallbacks para evitar erros de build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interface para autoridade no banco
export interface AutoridadeDB {
  id: string;
  nome: string;
  cargo: string;
  orgao: string;
  nivel_federativo: 'Federal' | 'Estadual' | 'Municipal';
  precedencia: number;
  presente: boolean;
  incluir_dispositivo: boolean;
  incluir_falas: boolean;
  ordem_fala: number;
  created_at?: string;
  updated_at?: string;
}

// Serviço para gerenciar autoridades
export const autoridadesService = {
  // Buscar todas as autoridades
  async getAll(): Promise<AutoridadeDB[]> {
    try {
      // Verificar se as variáveis de ambiente estão configuradas
      if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
        console.warn('Supabase não configurado, retornando dados vazios');
        return [];
      }

      const { data, error } = await supabase
        .from('autoridades')
        .select('*')
        .order('precedencia', { ascending: true });

      if (error) {
        console.error('Erro ao buscar autoridades:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro na conexão com Supabase:', error);
      return [];
    }
  },

  // Criar nova autoridade
  async create(autoridade: Omit<AutoridadeDB, 'created_at' | 'updated_at'>): Promise<AutoridadeDB | null> {
    try {
      if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
        console.warn('Supabase não configurado');
        return null;
      }

      const { data, error } = await supabase
        .from('autoridades')
        .insert([autoridade])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar autoridade:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro na criação:', error);
      throw error;
    }
  },

  // Atualizar autoridade
  async update(id: string, updates: Partial<Omit<AutoridadeDB, 'id' | 'created_at' | 'updated_at'>>): Promise<AutoridadeDB | null> {
    try {
      if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
        console.warn('Supabase não configurado');
        return null;
      }

      const { data, error } = await supabase
        .from('autoridades')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar autoridade:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro na atualização:', error);
      throw error;
    }
  },

  // Deletar autoridade
  async delete(id: string): Promise<boolean> {
    try {
      if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
        console.warn('Supabase não configurado');
        return false;
      }

      const { error } = await supabase
        .from('autoridades')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar autoridade:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro na deleção:', error);
      throw error;
    }
  },

  // Atualizar múltiplas autoridades (para reordenação)
  async updateMultiple(updates: Array<{ id: string; updates: Partial<Omit<AutoridadeDB, 'id' | 'created_at' | 'updated_at'>> }>): Promise<void> {
    try {
      if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
        console.warn('Supabase não configurado');
        return;
      }

      // Executar todas as atualizações em paralelo
      const promises = updates.map(({ id, updates: updateData }) =>
        supabase
          .from('autoridades')
          .update(updateData)
          .eq('id', id)
      );

      const results = await Promise.allSettled(promises);
      
      // Verificar se alguma falhou
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.error('Algumas atualizações falharam:', failures);
        throw new Error(`${failures.length} atualizações falharam`);
      }
    } catch (error) {
      console.error('Erro nas atualizações múltiplas:', error);
      throw error;
    }
  }
};

// Função para inicializar tabela (se necessário)
export const initializeDatabase = async () => {
  try {
    if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
      console.warn('Supabase não configurado, pulando inicialização');
      return false;
    }

    // Verificar se a tabela existe tentando fazer uma consulta simples
    const { error } = await supabase
      .from('autoridades')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Tabela autoridades não existe ou não está acessível:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao verificar banco:', error);
    return false;
  }
};