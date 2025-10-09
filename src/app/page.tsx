"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Users, 
  UserCheck, 
  Crown, 
  Mic, 
  UserPlus, 
  GripVertical,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  Search,
  Database,
  Wifi,
  WifiOff
} from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase, autoridadesService, AutoridadeDB } from '@/lib/supabase';

// Tipos
interface Autoridade {
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
}

// Dados das autoridades de Mato Grosso (para inicialização) - com UUIDs válidos
const autoridadesIniciais: Autoridade[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    nome: "Mauro Mendes Ferreira",
    cargo: "Governador do Estado",
    orgao: "Governo do Estado de Mato Grosso",
    nivelFederativo: "Estadual",
    precedencia: 1,
    presente: false,
    incluirDispositivo: false,
    incluirFalas: false,
    ordemFala: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    nome: "Otaviano Olavo Pivetta",
    cargo: "Vice-Governador do Estado",
    orgao: "Governo do Estado de Mato Grosso",
    nivelFederativo: "Estadual",
    precedencia: 2,
    presente: false,
    incluirDispositivo: false,
    incluirFalas: false,
    ordemFala: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    nome: "Eduardo Botelho",
    cargo: "Secretário de Estado de Fazenda",
    orgao: "SEFAZ-MT",
    nivelFederativo: "Estadual",
    precedencia: 3,
    presente: false,
    incluirDispositivo: false,
    incluirFalas: false,
    ordemFala: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    nome: "Gilberto Figueiredo",
    cargo: "Secretário de Estado de Saúde",
    orgao: "SES-MT",
    nivelFederativo: "Estadual",
    precedencia: 4,
    presente: false,
    incluirDispositivo: false,
    incluirFalas: false,
    ordemFala: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    nome: "Alan Resende Porto",
    cargo: "Secretário de Estado de Educação",
    orgao: "SEDUC-MT",
    nivelFederativo: "Estadual",
    precedencia: 5,
    presente: false,
    incluirDispositivo: false,
    incluirFalas: false,
    ordemFala: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    nome: "César Miranda",
    cargo: "Secretário de Estado de Segurança Pública",
    orgao: "SESP-MT",
    nivelFederativo: "Estadual",
    precedencia: 6,
    presente: false,
    incluirDispositivo: false,
    incluirFalas: false,
    ordemFala: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    nome: "Romero Reis de Souza",
    cargo: "Secretário de Estado de Infraestrutura e Logística",
    orgao: "SINFRA-MT",
    nivelFederativo: "Estadual",
    precedencia: 7,
    presente: false,
    incluirDispositivo: false,
    incluirFalas: false,
    ordemFala: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    nome: "Basílio Bezerra Neto",
    cargo: "Secretário de Estado de Desenvolvimento Econômico",
    orgao: "SEDEC-MT",
    nivelFederativo: "Estadual",
    precedencia: 8,
    presente: false,
    incluirDispositivo: false,
    incluirFalas: false,
    ordemFala: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    nome: "Virgílio Mendes",
    cargo: "Secretário de Estado de Meio Ambiente",
    orgao: "SEMA-MT",
    nivelFederativo: "Estadual",
    precedencia: 9,
    presente: false,
    incluirDispositivo: false,
    incluirFalas: false,
    ordemFala: 0
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    nome: "Silvano Amaral",
    cargo: "Secretário de Estado de Agricultura Familiar e Assuntos Fundiários",
    orgao: "SEAF-MT",
    nivelFederativo: "Estadual",
    precedencia: 10,
    presente: false,
    incluirDispositivo: false,
    incluirFalas: false,
    ordemFala: 0
  }
];

// Função para converter AutoridadeDB para Autoridade
const dbToAutoridade = (db: AutoridadeDB): Autoridade => ({
  id: db.id,
  nome: db.nome,
  cargo: db.cargo,
  orgao: db.orgao,
  nivelFederativo: db.nivel_federativo,
  precedencia: db.precedencia,
  presente: db.presente,
  incluirDispositivo: db.incluir_dispositivo,
  incluirFalas: db.incluir_falas,
  ordemFala: db.ordem_fala
});

// Função para converter Autoridade para AutoridadeDB
const autoridadeToDb = (autoridade: Autoridade): Omit<AutoridadeDB, 'created_at' | 'updated_at'> => ({
  id: autoridade.id,
  nome: autoridade.nome,
  cargo: autoridade.cargo,
  orgao: autoridade.orgao,
  nivel_federativo: autoridade.nivelFederativo,
  precedencia: autoridade.precedencia,
  presente: autoridade.presente,
  incluir_dispositivo: autoridade.incluirDispositivo,
  incluir_falas: autoridade.incluirFalas,
  ordem_fala: autoridade.ordemFala
});

// Componente para item arrastável
function SortableItem({ autoridade, children }: { autoridade: Autoridade; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: autoridade.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm">
        <div {...listeners} className="cursor-grab hover:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        {children}
      </div>
    </div>
  );
}

export default function CerimonialFacil() {
  // Estados principais
  const [autoridades, setAutoridades] = useState<Autoridade[]>([]);
  const [abaSelecionada, setAbaSelecionada] = useState("lista");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginData, setLoginData] = useState({ usuario: "", senha: "" });
  const [showLogin, setShowLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  // Estados para cadastro
  const [dialogAberto, setDialogAberto] = useState(false);
  const [autoridadeEditando, setAutoridadeEditando] = useState<Autoridade | null>(null);
  const [novaAutoridade, setNovaAutoridade] = useState({
    nome: "",
    cargo: "",
    orgao: "",
    nivelFederativo: "Estadual" as const
  });

  // Estado para busca
  const [termoBusca, setTermoBusca] = useState("");

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Função para inicializar dados no Supabase
  const inicializarDadosSupabase = async () => {
    try {
      // Verificar se já existem dados
      const dadosExistentes = await autoridadesService.getAll();
      
      if (dadosExistentes.length === 0) {
        // Inserir dados iniciais
        const promises = autoridadesIniciais.map(autoridade => 
          autoridadesService.create(autoridadeToDb(autoridade))
        );
        await Promise.all(promises);
        toast.success("Dados iniciais inseridos no banco!");
      }
      
      return dadosExistentes.length > 0 ? dadosExistentes.map(dbToAutoridade) : autoridadesIniciais;
    } catch (error) {
      console.error('Erro ao inicializar dados:', error);
      toast.error("Erro ao conectar com o banco. Usando dados locais.");
      return autoridadesIniciais;
    }
  };

  // Função para carregar dados do Supabase
  const carregarDadosSupabase = async () => {
    try {
      setIsLoading(true);
      const dados = await autoridadesService.getAll();
      const autoridadesConvertidas = dados.map(dbToAutoridade);
      setAutoridades(autoridadesConvertidas);
      setIsConnected(true);
      setIsOnline(true);
      toast.success("Dados sincronizados com o banco!");
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setIsConnected(false);
      setIsOnline(false);
      
      // Fallback para dados locais
      const dadosLocais = localStorage.getItem('cerimonial-autoridades');
      if (dadosLocais) {
        try {
          const autoridadesSalvas = JSON.parse(dadosLocais);
          setAutoridades(autoridadesSalvas);
          toast.warning("Usando dados locais - sem conexão com o banco");
        } catch {
          setAutoridades(autoridadesIniciais);
          toast.warning("Usando dados padrão - erro nos dados locais");
        }
      } else {
        setAutoridades(autoridadesIniciais);
        toast.warning("Usando dados padrão - sem conexão");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Configurar subscription para tempo real
  useEffect(() => {
    let subscription: any = null;

    const setupRealtimeSubscription = () => {
      subscription = supabase
        .channel('autoridades_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'autoridades'
          },
          (payload) => {
            console.log('Mudança detectada:', payload);
            
            if (payload.eventType === 'INSERT') {
              const novaAutoridade = dbToAutoridade(payload.new as AutoridadeDB);
              setAutoridades(prev => {
                const existe = prev.find(a => a.id === novaAutoridade.id);
                if (!existe) {
                  toast.info(`Nova autoridade adicionada: ${novaAutoridade.nome}`);
                  return [...prev, novaAutoridade].sort((a, b) => a.precedencia - b.precedencia);
                }
                return prev;
              });
            } else if (payload.eventType === 'UPDATE') {
              const autoridadeAtualizada = dbToAutoridade(payload.new as AutoridadeDB);
              setAutoridades(prev => {
                const novaLista = prev.map(a => a.id === autoridadeAtualizada.id ? autoridadeAtualizada : a)
                    .sort((a, b) => a.precedencia - b.precedencia);
                
                // Verificar se houve mudança na limpeza de campos
                const autoridadeAnterior = prev.find(a => a.id === autoridadeAtualizada.id);
                if (autoridadeAnterior && !autoridadeAtualizada.presente && autoridadeAnterior.presente) {
                  // Se a presença foi removida, limpar dispositivo e falas
                  return novaLista.map(a => 
                    a.id === autoridadeAtualizada.id 
                      ? { ...a, incluirDispositivo: false, incluirFalas: false, ordemFala: 0 }
                      : a
                  );
                }
                
                if (autoridadeAnterior && !autoridadeAtualizada.incluirDispositivo && autoridadeAnterior.incluirDispositivo) {
                  // Se o dispositivo foi removido, limpar falas
                  return novaLista.map(a => 
                    a.id === autoridadeAtualizada.id 
                      ? { ...a, incluirFalas: false, ordemFala: 0 }
                      : a
                  );
                }
                
                return novaLista;
              });
              toast.info(`Autoridade atualizada: ${autoridadeAtualizada.nome}`);
            } else if (payload.eventType === 'DELETE') {
              const autoridadeRemovida = payload.old as AutoridadeDB;
              setAutoridades(prev => prev.filter(a => a.id !== autoridadeRemovida.id));
              toast.info(`Autoridade removida: ${autoridadeRemovida.nome}`);
            }
          }
        )
        .subscribe();

      return subscription;
    };

    if (isLoggedIn && isConnected) {
      subscription = setupRealtimeSubscription();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [isLoggedIn, isConnected]);

  // Carregar dados na inicialização
  useEffect(() => {
    const carregarDados = async () => {
      if (isLoggedIn) {
        await carregarDadosSupabase();
      }
    };

    carregarDados();
  }, [isLoggedIn]);

  // Salvar dados localmente sempre que autoridades mudarem (backup)
  useEffect(() => {
    if (autoridades.length > 0) {
      localStorage.setItem('cerimonial-autoridades', JSON.stringify(autoridades));
    }
  }, [autoridades]);

  // Função de login
  const handleLogin = async () => {
    if (loginData.usuario === "Gezuz" && loginData.senha === "Gil080123*") {
      setIsLoggedIn(true);
      setIsAdmin(true);
      setShowLogin(false);
      toast.success("Login administrativo realizado com sucesso!");
      
      // Inicializar dados no Supabase se necessário
      const dadosIniciais = await inicializarDadosSupabase();
      setAutoridades(dadosIniciais);
      setIsConnected(true);
    } else if (loginData.usuario === "admin" && loginData.senha === "admin") {
      setIsLoggedIn(true);
      setIsAdmin(false);
      setShowLogin(false);
      toast.success("Login da equipe realizado com sucesso!");
      await carregarDadosSupabase();
    } else if (loginData.usuario && loginData.senha) {
      setIsLoggedIn(true);
      setIsAdmin(false);
      setShowLogin(false);
      toast.success("Login realizado com sucesso!");
      await carregarDadosSupabase();
    } else {
      toast.error("Usuário e senha são obrigatórios");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setShowLogin(true);
    setLoginData({ usuario: "", senha: "" });
    setAbaSelecionada("lista");
    setIsConnected(false);
    toast.success("Logout realizado com sucesso!");
  };

  // Função para marcar presença (botão PRESENTE -> OK) - COM SUPABASE
  const marcarPresenca = async (id: string) => {
    const autoridade = autoridades.find(a => a.id === id);
    if (!autoridade) return;

    const novoEstado = !autoridade.presente;
    
    try {
      // Se removendo presença, limpar dispositivo e falas também
      const updates: any = { presente: novoEstado };
      if (!novoEstado) {
        updates.incluir_dispositivo = false;
        updates.incluir_falas = false;
        updates.ordem_fala = 0;
      }
      
      if (isConnected) {
        await autoridadesService.update(id, updates);
      }
      
      setAutoridades(prev => prev.map(a => 
        a.id === id ? { 
          ...a, 
          presente: novoEstado,
          incluirDispositivo: novoEstado ? a.incluirDispositivo : false,
          incluirFalas: novoEstado ? a.incluirFalas : false,
          ordemFala: novoEstado ? a.ordemFala : 0
        } : a
      ));
      
      toast.success(novoEstado ? "Presença confirmada!" : "Presença removida!");
    } catch (error) {
      console.error('Erro ao atualizar presença:', error);
      toast.error("Erro ao atualizar presença no banco");
      
      // Atualizar localmente mesmo com erro
      setAutoridades(prev => prev.map(a => 
        a.id === id ? { 
          ...a, 
          presente: novoEstado,
          incluirDispositivo: novoEstado ? a.incluirDispositivo : false,
          incluirFalas: novoEstado ? a.incluirFalas : false,
          ordemFala: novoEstado ? a.ordemFala : 0
        } : a
      ));
    }
  };

  // Função para incluir no dispositivo - COM SUPABASE
  const incluirDispositivo = async (id: string, incluir: boolean) => {
    try {
      const updates = { 
        incluir_dispositivo: incluir, 
        incluir_falas: incluir ? autoridades.find(a => a.id === id)?.incluirFalas || false : false,
        ordem_fala: incluir ? autoridades.find(a => a.id === id)?.ordemFala || 0 : 0
      };
      
      if (isConnected) {
        await autoridadesService.update(id, updates);
      }
      
      setAutoridades(prev => prev.map(a => 
        a.id === id ? { 
          ...a, 
          incluirDispositivo: incluir, 
          incluirFalas: incluir ? a.incluirFalas : false,
          ordemFala: incluir ? a.ordemFala : 0
        } : a
      ));
      
      toast.success(incluir ? "Adicionado ao dispositivo!" : "Removido do dispositivo!");
    } catch (error) {
      console.error('Erro ao atualizar dispositivo:', error);
      toast.error("Erro ao atualizar no banco");
    }
  };

  // Função para incluir nas falas - COM SUPABASE
  const incluirFalas = async (id: string, incluir: boolean) => {
    try {
      const ordemFala = incluir ? (autoridades.find(a => a.id === id)?.ordemFala || 1) : 0;
      
      if (isConnected) {
        await autoridadesService.update(id, { 
          incluir_falas: incluir, 
          ordem_fala: ordemFala 
        });
      }
      
      setAutoridades(prev => prev.map(a => 
        a.id === id ? { ...a, incluirFalas: incluir, ordemFala } : a
      ));
      
      toast.success(incluir ? "Adicionado às falas!" : "Removido das falas!");
    } catch (error) {
      console.error('Erro ao atualizar falas:', error);
      toast.error("Erro ao atualizar no banco");
    }
  };

  // Função para adicionar nova autoridade - COM SUPABASE
  const adicionarAutoridade = async () => {
    if (!novaAutoridade.nome || !novaAutoridade.cargo || !novaAutoridade.orgao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const novaAutoridadeCompleta: Autoridade = {
      id: crypto.randomUUID(),
      ...novaAutoridade,
      precedencia: autoridades.length + 1,
      presente: false,
      incluirDispositivo: false,
      incluirFalas: false,
      ordemFala: 0
    };

    try {
      if (isConnected) {
        await autoridadesService.create(autoridadeToDb(novaAutoridadeCompleta));
      }
      
      setAutoridades(prev => [...prev, novaAutoridadeCompleta]);
      setNovaAutoridade({ nome: "", cargo: "", orgao: "", nivelFederativo: "Estadual" });
      setDialogAberto(false);
      toast.success("Autoridade adicionada com sucesso!");
    } catch (error) {
      console.error('Erro ao adicionar autoridade:', error);
      toast.error("Erro ao salvar no banco");
    }
  };

  // Função para editar autoridade - COM SUPABASE
  const editarAutoridade = (autoridade: Autoridade) => {
    setAutoridadeEditando(autoridade);
    setNovaAutoridade({
      nome: autoridade.nome,
      cargo: autoridade.cargo,
      orgao: autoridade.orgao,
      nivelFederativo: autoridade.nivelFederativo
    });
    setDialogAberto(true);
  };

  const salvarEdicaoAutoridade = async () => {
    if (!autoridadeEditando) return;

    try {
      if (isConnected) {
        await autoridadesService.update(autoridadeEditando.id, {
          nome: novaAutoridade.nome,
          cargo: novaAutoridade.cargo,
          orgao: novaAutoridade.orgao,
          nivel_federativo: novaAutoridade.nivelFederativo
        });
      }
      
      setAutoridades(prev => prev.map(a => 
        a.id === autoridadeEditando.id 
          ? { ...a, ...novaAutoridade }
          : a
      ));

      setAutoridadeEditando(null);
      setNovaAutoridade({ nome: "", cargo: "", orgao: "", nivelFederativo: "Estadual" });
      setDialogAberto(false);
      toast.success("Autoridade atualizada!");
    } catch (error) {
      console.error('Erro ao editar autoridade:', error);
      toast.error("Erro ao salvar no banco");
    }
  };

  // Função para remover autoridade - COM SUPABASE
  const removerAutoridade = async (id: string) => {
    try {
      if (isConnected) {
        await autoridadesService.delete(id);
      }
      
      setAutoridades(prev => prev.filter(a => a.id !== id));
      toast.success("Autoridade removida!");
    } catch (error) {
      console.error('Erro ao remover autoridade:', error);
      toast.error("Erro ao remover do banco");
    }
  };

  // Função para atualizar dados manualmente
  const atualizarDados = async () => {
    await carregarDadosSupabase();
  };

  // Drag and drop para dispositivo - COM SUPABASE
  const handleDragEndDispositivo = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setAutoridades(prev => {
      const autoridadesDispositivo = prev.filter(a => a.incluirDispositivo);
      const autoridadesOutras = prev.filter(a => !a.incluirDispositivo);
      
      const oldIndex = autoridadesDispositivo.findIndex(a => a.id === active.id);
      const newIndex = autoridadesDispositivo.findIndex(a => a.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      const novaOrdemDispositivo = arrayMove(autoridadesDispositivo, oldIndex, newIndex);
      
      const autoridadesAtualizadas = novaOrdemDispositivo.map((autoridade, index) => ({
        ...autoridade,
        precedencia: index + 1
      }));
      
      // Atualizar no Supabase
      if (isConnected) {
        const updates = autoridadesAtualizadas.map(autoridade => ({
          id: autoridade.id,
          updates: { precedencia: autoridade.precedencia }
        }));
        
        autoridadesService.updateMultiple(updates).catch(error => {
          console.error('Erro ao atualizar ordem no banco:', error);
          toast.error("Erro ao salvar nova ordem no banco");
        });
      }
      
      const resultado = [...autoridadesAtualizadas, ...autoridadesOutras];
      toast.success("Ordem do dispositivo atualizada!");
      return resultado;
    });
  };

  // Drag and drop para falas - COM SUPABASE
  const handleDragEndFalas = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setAutoridades(prev => {
      const autoridadesFala = prev.filter(a => a.incluirFalas).sort((a, b) => a.ordemFala - b.ordemFala);
      const autoridadesOutras = prev.filter(a => !a.incluirFalas);
      
      const oldIndex = autoridadesFala.findIndex(a => a.id === active.id);
      const newIndex = autoridadesFala.findIndex(a => a.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      const novaOrdemFala = arrayMove(autoridadesFala, oldIndex, newIndex);
      
      const autoridadesAtualizadas = novaOrdemFala.map((autoridade, index) => ({
        ...autoridade,
        ordemFala: index + 1
      }));
      
      // Atualizar no Supabase
      if (isConnected) {
        const updates = autoridadesAtualizadas.map(autoridade => ({
          id: autoridade.id,
          updates: { ordem_fala: autoridade.ordemFala }
        }));
        
        autoridadesService.updateMultiple(updates).catch(error => {
          console.error('Erro ao atualizar ordem das falas no banco:', error);
          toast.error("Erro ao salvar nova ordem das falas no banco");
        });
      }
      
      const resultado = [...autoridadesAtualizadas, ...autoridadesOutras];
      toast.success("Ordem das falas atualizada!");
      return resultado;
    });
  };

  // Filtrar autoridades com base na busca
  const autoridadesFiltradas = autoridades.filter(autoridade => 
    autoridade.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    autoridade.cargo.toLowerCase().includes(termoBusca.toLowerCase()) ||
    autoridade.orgao.toLowerCase().includes(termoBusca.toLowerCase())
  );

  // Dados derivados - CORRIGIDOS com ordenação adequada
  const autoridadesPresentes = autoridades.filter(a => a.presente).sort((a, b) => a.precedencia - b.precedencia);
  const autoridadesDispositivo = autoridades.filter(a => a.incluirDispositivo).sort((a, b) => a.precedencia - b.precedencia);
  // FALAS: ordem inversa (menor precedência para maior - menos autoridade para mais autoridade)
  const autoridadesFala = autoridades.filter(a => a.incluirFalas).sort((a, b) => b.precedencia - a.precedencia);

  // Tela de login
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-lg">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/4ced500d-237b-4a49-b5e0-b570ed0b584f.jpg" 
                alt="Brasão MT" 
                className="w-full h-full object-cover"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Cerimonial Fácil</CardTitle>
            <CardDescription>Governo do Estado de Mato Grosso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário</Label>
              <Input
                id="usuario"
                type="text"
                value={loginData.usuario}
                onChange={(e) => setLoginData(prev => ({ ...prev, usuario: e.target.value }))}
                placeholder="Digite seu usuário"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  value={loginData.senha}
                  onChange={(e) => setLoginData(prev => ({ ...prev, senha: e.target.value }))}
                  placeholder="Digite sua senha"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
              {isLoading ? "Carregando..." : "Entrar"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/4ced500d-237b-4a49-b5e0-b570ed0b584f.jpg" 
                alt="Brasão MT" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Cerimonial Fácil</h1>
              <p className="text-blue-100 text-sm">Governo do Estado de Mato Grosso</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={atualizarDados}
              className="text-white hover:bg-white/20"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Badge variant={isConnected && isOnline ? "default" : "destructive"} className="text-xs">
              {isConnected && isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {isConnected && isOnline ? "Online" : "Offline"}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {isAdmin ? "Admin" : "Equipe"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="lista" className="flex items-center gap-2 text-xs sm:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Lista de</span>
              <span>Autoridades</span>
            </TabsTrigger>
            <TabsTrigger value="presenca" className="flex items-center gap-2 text-xs sm:text-sm">
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Registro de</span>
              <span>Presença</span>
            </TabsTrigger>
            <TabsTrigger value="dispositivo" className="flex items-center gap-2 text-xs sm:text-sm">
              <Crown className="w-4 h-4" />
              <span>Dispositivo</span>
            </TabsTrigger>
            <TabsTrigger value="falas" className="flex items-center gap-2 text-xs sm:text-sm">
              <Mic className="w-4 h-4" />
              <span>Falas</span>
            </TabsTrigger>
          </TabsList>

          {/* ABA 1 - LISTA DE AUTORIDADES */}
          <TabsContent value="lista" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Lista de Autoridades
                    </CardTitle>
                    <CardDescription>
                      Autoridades cadastradas no sistema ({autoridadesFiltradas.length} de {autoridades.length} total)
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          Cadastrar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>
                            {autoridadeEditando ? 'Editar Autoridade' : 'Cadastrar Nova Autoridade'}
                          </DialogTitle>
                          <DialogDescription>
                            Preencha os dados da autoridade
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="nome">Nome Completo *</Label>
                            <Input
                              id="nome"
                              value={novaAutoridade.nome}
                              onChange={(e) => setNovaAutoridade(prev => ({ ...prev, nome: e.target.value }))}
                              placeholder="Nome completo da autoridade"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cargo">Cargo *</Label>
                            <Input
                              id="cargo"
                              value={novaAutoridade.cargo}
                              onChange={(e) => setNovaAutoridade(prev => ({ ...prev, cargo: e.target.value }))}
                              placeholder="Ex: Governador, Secretário, Prefeito"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="orgao">Órgão/Instituição *</Label>
                            <Input
                              id="orgao"
                              value={novaAutoridade.orgao}
                              onChange={(e) => setNovaAutoridade(prev => ({ ...prev, orgao: e.target.value }))}
                              placeholder="Ex: Governo do Estado, Prefeitura"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nivel">Nível Federativo *</Label>
                            <Select
                              value={novaAutoridade.nivelFederativo}
                              onValueChange={(value: any) => setNovaAutoridade(prev => ({ ...prev, nivelFederativo: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Federal">Federal</SelectItem>
                                <SelectItem value="Estadual">Estadual</SelectItem>
                                <SelectItem value="Municipal">Municipal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setDialogAberto(false);
                              setAutoridadeEditando(null);
                              setNovaAutoridade({ nome: "", cargo: "", orgao: "", nivelFederativo: "Estadual" });
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button onClick={autoridadeEditando ? salvarEdicaoAutoridade : adicionarAutoridade}>
                            {autoridadeEditando ? 'Salvar' : 'Cadastrar'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Campo de Busca */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nome, cargo ou órgão..."
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {autoridadesFiltradas.map((autoridade) => (
                      <div key={autoridade.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 text-sm">{autoridade.nome}</h4>
                            <Badge variant={autoridade.nivelFederativo === 'Federal' ? 'default' : 
                                          autoridade.nivelFederativo === 'Estadual' ? 'secondary' : 'outline'}
                                   className="text-xs">
                              {autoridade.nivelFederativo}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{autoridade.cargo}</p>
                          <p className="text-xs text-gray-500">{autoridade.orgao}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editarAutoridade(autoridade)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removerAutoridade(autoridade.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            onClick={() => marcarPresenca(autoridade.id)}
                            className={`text-xs px-3 py-1 ${
                              autoridade.presente 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            {autoridade.presente ? 'OK' : 'PRESENTE'}
                          </Button>
                        </div>
                      </div>
                    ))}
                    {autoridadesFiltradas.length === 0 && termoBusca && (
                      <div className="text-center py-8 text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma autoridade encontrada para "{termoBusca}"</p>
                        <p className="text-xs">Tente buscar por nome, cargo ou órgão</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 2 - REGISTRO DE PRESENÇA (EM ORDEM DE PRECEDÊNCIA) */}
          <TabsContent value="presenca" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Registro de Presença
                </CardTitle>
                <CardDescription>
                  Autoridades presentes em ordem de precedência ({autoridadesPresentes.length} presentes)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {autoridadesPresentes.map((autoridade, index) => (
                      <div key={autoridade.id} className="flex items-center space-x-3 p-3 bg-white border rounded-lg shadow-sm">
                        <Badge variant="default" className="min-w-[32px] h-6 flex items-center justify-center text-xs">
                          {index + 1}º
                        </Badge>
                        <Checkbox
                          id={`dispositivo-${autoridade.id}`}
                          checked={autoridade.incluirDispositivo}
                          onCheckedChange={(checked) => incluirDispositivo(autoridade.id, checked as boolean)}
                          disabled={!isAdmin}
                        />
                        <div className={`flex-1 min-w-0 ${!autoridade.incluirDispositivo ? 'font-bold' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm text-gray-900">{autoridade.nome}</h4>
                            <Badge variant="outline" className="text-xs text-green-600">Presente</Badge>
                            {!autoridade.incluirDispositivo && (
                              <Badge variant="outline" className="text-xs text-orange-600">Apenas Menção</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{autoridade.cargo}</p>
                          <p className="text-xs text-gray-500">{autoridade.orgao}</p>
                        </div>
                      </div>
                    ))}
                    {autoridadesPresentes.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma autoridade marcada como presente</p>
                        <p className="text-xs">Vá para "Lista de Autoridades" e marque as presenças</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 3 - DISPOSITIVO (COM DRAG AND DROP) */}
          <TabsContent value="dispositivo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Dispositivo Oficial
                </CardTitle>
                <CardDescription>
                  Ordem de precedência (arraste para reordenar) - {autoridadesDispositivo.length} no dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEndDispositivo}
                  >
                    <SortableContext
                      items={autoridadesDispositivo.map(a => a.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {autoridadesDispositivo.map((autoridade, index) => (
                          <SortableItem key={autoridade.id} autoridade={autoridade}>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="min-w-[24px] h-6 flex items-center justify-center text-xs">
                                {index + 1}
                              </Badge>
                              <Checkbox
                                checked={autoridade.incluirFalas}
                                onCheckedChange={(checked) => incluirFalas(autoridade.id, checked as boolean)}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm">{autoridade.nome}</h4>
                              <p className="text-xs text-gray-600">{autoridade.cargo}</p>
                              <p className="text-xs text-gray-500">{autoridade.orgao}</p>
                            </div>
                            {autoridade.incluirFalas && (
                              <Mic className="w-4 h-4 text-blue-500" />
                            )}
                          </SortableItem>
                        ))}
                        {autoridadesDispositivo.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Crown className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhuma autoridade selecionada para o dispositivo</p>
                            <p className="text-xs">Vá para "Registro de Presença" e marque as autoridades</p>
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 4 - FALAS (COM DRAG AND DROP) - ORDEM INVERSA */}
          <TabsContent value="falas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Ordem das Falas
                </CardTitle>
                <CardDescription>
                  Ordem das falas - menor para maior autoridade (arraste para reordenar) - {autoridadesFala.length} oradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEndFalas}
                  >
                    <SortableContext
                      items={autoridadesFala.map(a => a.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {autoridadesFala.map((autoridade, index) => (
                          <SortableItem key={autoridade.id} autoridade={autoridade}>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="min-w-[24px] h-6 flex items-center justify-center text-xs">
                                {index + 1}º
                              </Badge>
                              <Mic className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm">{autoridade.nome}</h4>
                              <p className="text-xs text-gray-600">{autoridade.cargo}</p>
                              <p className="text-xs text-gray-500">{autoridade.orgao}</p>
                            </div>
                          </SortableItem>
                        ))}
                        {autoridadesFala.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Mic className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhuma autoridade selecionada para falar</p>
                            <p className="text-xs">Vá para "Dispositivo" e marque as autoridades que falarão</p>
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}