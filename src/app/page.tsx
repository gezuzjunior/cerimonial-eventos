"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
  WifiOff,
  FileText,
  Upload,
  CheckCircle,
  Download,
  FolderOpen,
  Calendar
} from "lucide-react";

// Função para gerar UUID compatível
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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

interface EventoEntregue {
  id: string;
  nome: string;
  data: string;
  roteiro: string;
  historico_presenca: Autoridade[];
  composicao_dispositivo: Autoridade[];
  falas_registradas: Autoridade[];
}

// Dados das autoridades de Mato Grosso (para inicialização)
const autoridadesIniciais: Autoridade[] = [
  {
    id: generateUUID(),
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
    id: generateUUID(),
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
    id: generateUUID(),
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
    id: generateUUID(),
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
    id: generateUUID(),
    nome: "Alan Resende Porto",
    cargo: "Secretário de Estado de Educação",
    orgao: "SEDUC-MT",
    nivelFederativo: "Estadual",
    precedencia: 5,
    presente: false,
    incluirDispositivo: false,
    incluirFalas: false,
    ordemFala: 0
  }
];

// Componente para item arrastável - SIMPLIFICADO
function SortableItem({ autoridade, children, index }: { autoridade: Autoridade; children: React.ReactNode; index: number }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm">
      <div className="cursor-grab hover:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      {children}
    </div>
  );
}

export default function CerimonialFacil() {
  // Estados principais
  const [autoridades, setAutoridades] = useState<Autoridade[]>([]);
  const [abaSelecionada, setAbaSelecionada] = useState("roteiro");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginData, setLoginData] = useState({ usuario: "", senha: "" });
  const [showLogin, setShowLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  
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

  // Estados para ROTEIRO
  const [roteiroTexto, setRoteiroTexto] = useState("");
  const [nomeEvento, setNomeEvento] = useState("");
  const [arquivoRoteiro, setArquivoRoteiro] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para EVENTOS ENTREGUES
  const [eventosEntregues, setEventosEntregues] = useState<EventoEntregue[]>([]);
  const [eventoSelecionado, setEventoSelecionado] = useState<EventoEntregue | null>(null);
  const [dialogEventoAberto, setDialogEventoAberto] = useState(false);

  // Função para detectar se está online
  const checkOnlineStatus = useCallback(() => {
    setIsOnline(navigator.onLine);
  }, []);

  // Função para verificar conexão com Supabase - SEMPRE OFFLINE
  const verificarConexaoSupabase = useCallback(async () => {
    console.log('🔌 Modo offline: conexão desabilitada');
    setIsConnected(false);
    return false;
  }, []);

  // Função para recuperar dados (apenas localStorage)
  const recuperarDados = useCallback(async () => {
    console.log('🔄 Iniciando recuperação de dados (modo offline)...');
    setIsLoading(true);
    
    try {
      // Carregar do localStorage
      const dadosLocais = localStorage.getItem('cerimonial-autoridades');
      if (dadosLocais) {
        try {
          const autoridadesSalvas = JSON.parse(dadosLocais);
          if (autoridadesSalvas && autoridadesSalvas.length > 0) {
            console.log('💾 Dados carregados do localStorage:', autoridadesSalvas.length, 'autoridades');
            setAutoridades(autoridadesSalvas);
            
            const lastSyncStr = localStorage.getItem('cerimonial-last-sync');
            if (lastSyncStr) {
              setLastSync(new Date(lastSyncStr));
            }
            
            toast.info(`💾 ${autoridadesSalvas.length} autoridades carregadas localmente`);
            return;
          }
        } catch (error) {
          console.warn('⚠️ Erro ao carregar do localStorage:', error);
        }
      }

      // Usar dados iniciais como último recurso
      console.log('🏁 Usando dados iniciais padrão');
      setAutoridades(autoridadesIniciais);
      
      // Salvar dados iniciais no localStorage
      localStorage.setItem('cerimonial-autoridades', JSON.stringify(autoridadesIniciais));
      
      toast.success(`🏁 ${autoridadesIniciais.length} autoridades iniciais carregadas`);
    } catch (error) {
      console.error('Erro na recuperação de dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para carregar eventos entregues
  const carregarEventosEntregues = useCallback(() => {
    const eventosStr = localStorage.getItem('cerimonial-eventos-entregues');
    if (eventosStr) {
      try {
        const eventos = JSON.parse(eventosStr);
        setEventosEntregues(eventos);
      } catch (error) {
        console.warn('Erro ao carregar eventos entregues:', error);
      }
    }
  }, []);

  // Efeito para detectar mudanças de conectividade
  useEffect(() => {
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
    
    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, [checkOnlineStatus]);

  // Efeito para inicialização
  useEffect(() => {
    recuperarDados();
    carregarEventosEntregues();
    verificarConexaoSupabase();
  }, [recuperarDados, carregarEventosEntregues, verificarConexaoSupabase]);

  // Função de login
  const handleLogin = async () => {
    if (loginData.usuario === "Gezuz" && loginData.senha === "Gil080123*") {
      setIsLoggedIn(true);
      setIsAdmin(true);
      setShowLogin(false);
      toast.success("Login administrativo realizado!");
    } else if (loginData.usuario === "admin" && loginData.senha === "admin") {
      setIsLoggedIn(true);
      setIsAdmin(false);
      setShowLogin(false);
      toast.success("Login da equipe realizado!");
    } else if (loginData.usuario && loginData.senha) {
      setIsLoggedIn(true);
      setIsAdmin(false);
      setShowLogin(false);
      toast.success("Login realizado!");
    } else {
      toast.error("Usuário e senha são obrigatórios");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setShowLogin(true);
    setLoginData({ usuario: "", senha: "" });
    setAbaSelecionada("roteiro");
    setIsConnected(false);
    
    toast.success("Logout realizado!");
  };

  // Função para upload de arquivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setArquivoRoteiro(file);
    
    try {
      let texto = "";
      
      if (file.type === "text/plain") {
        texto = await file.text();
      } else {
        // Para outros tipos, implementação básica
        const reader = new FileReader();
        reader.onload = (e) => {
          texto = "Conteúdo do arquivo carregado. Para melhor visualização, edite o texto abaixo.";
          setRoteiroTexto(texto);
        };
        reader.readAsText(file);
        return;
      }
      
      setRoteiroTexto(texto);
      toast.success("Arquivo carregado com sucesso!");
    } catch (error) {
      console.error("Erro ao ler arquivo:", error);
      toast.error("Erro ao ler o arquivo");
    }
  };

  // Função para finalizar evento
  const finalizarEvento = () => {
    if (!nomeEvento.trim()) {
      toast.error("Digite o nome do evento antes de finalizar");
      return;
    }

    if (!roteiroTexto.trim()) {
      toast.error("Adicione um roteiro antes de finalizar");
      return;
    }

    const novoEvento: EventoEntregue = {
      id: generateUUID(),
      nome: nomeEvento,
      data: new Date().toLocaleDateString('pt-BR'),
      roteiro: roteiroTexto,
      historico_presenca: autoridades.filter(a => a.presente),
      composicao_dispositivo: autoridades.filter(a => a.incluirDispositivo),
      falas_registradas: autoridades.filter(a => a.incluirFalas)
    };

    const novosEventos = [...eventosEntregues, novoEvento];
    setEventosEntregues(novosEventos);
    localStorage.setItem('cerimonial-eventos-entregues', JSON.stringify(novosEventos));

    // Limpar dados do evento atual
    setNomeEvento("");
    setRoteiroTexto("");
    setArquivoRoteiro(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Resetar autoridades
    const autoridadesResetadas = autoridades.map(a => ({
      ...a,
      presente: false,
      incluirDispositivo: false,
      incluirFalas: false,
      ordemFala: 0
    }));
    setAutoridades(autoridadesResetadas);
    localStorage.setItem('cerimonial-autoridades', JSON.stringify(autoridadesResetadas));

    toast.success("Evento finalizado e salvo com sucesso!");
    setAbaSelecionada("eventos-entregues");
  };

  // Função para exportar PDF
  const exportarPDF = async (evento: EventoEntregue) => {
    try {
      const conteudo = `
RELATÓRIO DO EVENTO: ${evento.nome}
Data: ${evento.data}

ROTEIRO:
${evento.roteiro}

HISTÓRICO DE PRESENÇA (${evento.historico_presenca.length} presentes):
${evento.historico_presenca.map((a, i) => `${i + 1}. ${a.nome} - ${a.cargo} - ${a.orgao}`).join('\n')}

COMPOSIÇÃO DO DISPOSITIVO (${evento.composicao_dispositivo.length} autoridades):
${evento.composicao_dispositivo.map((a, i) => `${i + 1}. ${a.nome} - ${a.cargo} - ${a.orgao}`).join('\n')}

FALAS REGISTRADAS (${evento.falas_registradas.length} oradores):
${evento.falas_registradas.map((a, i) => `${i + 1}. ${a.nome} - ${a.cargo} - ${a.orgao}`).join('\n')}
      `;

      // Criar e baixar arquivo
      const blob = new Blob([conteudo], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${evento.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${evento.data.replace(/\//g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar relatório");
    }
  };

  // Função para marcar presença
  const marcarPresenca = async (id: string) => {
    const autoridade = autoridades.find(a => a.id === id);
    if (!autoridade) return;

    const novoEstado = !autoridade.presente;
    
    const novasAutoridades = autoridades.map(a => 
      a.id === id ? { 
        ...a, 
        presente: novoEstado,
        incluirDispositivo: novoEstado ? a.incluirDispositivo : false,
        incluirFalas: novoEstado ? a.incluirFalas : false,
        ordemFala: novoEstado ? a.ordemFala : 0
      } : a
    );
    
    setAutoridades(novasAutoridades);
    localStorage.setItem('cerimonial-autoridades', JSON.stringify(novasAutoridades));
    localStorage.setItem('cerimonial-last-sync', new Date().toISOString());
    setLastSync(new Date());
    
    toast.success(novoEstado ? "Presença confirmada!" : "Presença removida!");
  };

  // Função para incluir no dispositivo
  const incluirDispositivo = async (id: string, incluir: boolean) => {
    const novasAutoridades = autoridades.map(a => 
      a.id === id ? { 
        ...a, 
        incluirDispositivo: incluir, 
        incluirFalas: incluir ? a.incluirFalas : false,
        ordemFala: incluir ? a.ordemFala : 0
      } : a
    );
    
    setAutoridades(novasAutoridades);
    localStorage.setItem('cerimonial-autoridades', JSON.stringify(novasAutoridades));
    localStorage.setItem('cerimonial-last-sync', new Date().toISOString());
    setLastSync(new Date());
    
    toast.success(incluir ? "Adicionado ao dispositivo!" : "Removido do dispositivo!");
  };

  // Função para incluir nas falas
  const incluirFalas = async (id: string, incluir: boolean) => {
    const autoridade = autoridades.find(a => a.id === id);
    if (!autoridade) return;
    
    const ordemFala = incluir ? (autoridade.ordemFala || 1) : 0;
    
    const novasAutoridades = autoridades.map(a => 
      a.id === id ? { ...a, incluirFalas: incluir, ordemFala } : a
    );
    
    setAutoridades(novasAutoridades);
    localStorage.setItem('cerimonial-autoridades', JSON.stringify(novasAutoridades));
    localStorage.setItem('cerimonial-last-sync', new Date().toISOString());
    setLastSync(new Date());
    
    toast.success(incluir ? "Adicionado às falas!" : "Removido das falas!");
  };

  // Função para adicionar nova autoridade
  const adicionarAutoridade = async () => {
    if (!novaAutoridade.nome || !novaAutoridade.cargo || !novaAutoridade.orgao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const novaAutoridadeCompleta: Autoridade = {
      id: generateUUID(),
      ...novaAutoridade,
      precedencia: autoridades.length + 1,
      presente: false,
      incluirDispositivo: false,
      incluirFalas: false,
      ordemFala: 0
    };

    const novasAutoridades = [...autoridades, novaAutoridadeCompleta];
    setAutoridades(novasAutoridades);
    localStorage.setItem('cerimonial-autoridades', JSON.stringify(novasAutoridades));
    localStorage.setItem('cerimonial-last-sync', new Date().toISOString());
    setLastSync(new Date());

    toast.success("Autoridade adicionada localmente!");

    setNovaAutoridade({ nome: "", cargo: "", orgao: "", nivelFederativo: "Estadual" });
    setDialogAberto(false);
  };

  // Função para editar autoridade
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

    const novasAutoridades = autoridades.map(a => 
      a.id === autoridadeEditando.id ? {
        ...a,
        nome: novaAutoridade.nome,
        cargo: novaAutoridade.cargo,
        orgao: novaAutoridade.orgao,
        nivelFederativo: novaAutoridade.nivelFederativo
      } : a
    );
    
    setAutoridades(novasAutoridades);
    localStorage.setItem('cerimonial-autoridades', JSON.stringify(novasAutoridades));
    localStorage.setItem('cerimonial-last-sync', new Date().toISOString());
    setLastSync(new Date());

    toast.success("Autoridade atualizada localmente!");

    setAutoridadeEditando(null);
    setNovaAutoridade({ nome: "", cargo: "", orgao: "", nivelFederativo: "Estadual" });
    setDialogAberto(false);
  };

  // Função para remover autoridade
  const removerAutoridade = async (id: string) => {
    const novasAutoridades = autoridades.filter(a => a.id !== id);
    setAutoridades(novasAutoridades);
    localStorage.setItem('cerimonial-autoridades', JSON.stringify(novasAutoridades));
    localStorage.setItem('cerimonial-last-sync', new Date().toISOString());
    setLastSync(new Date());
    
    toast.success("Autoridade removida localmente!");
  };

  // Função para atualizar dados manualmente
  const atualizarDados = async () => {
    await recuperarDados();
  };

  // Filtrar autoridades com base na busca
  const autoridadesFiltradas = autoridades.filter(autoridade => 
    autoridade.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    autoridade.cargo.toLowerCase().includes(termoBusca.toLowerCase()) ||
    autoridade.orgao.toLowerCase().includes(termoBusca.toLowerCase())
  );

  // Dados derivados
  const autoridadesPresentes = autoridades.filter(a => a.presente).sort((a, b) => a.precedencia - b.precedencia);
  const autoridadesDispositivo = autoridades.filter(a => a.incluirDispositivo).sort((a, b) => a.precedencia - b.precedencia);
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
            <Badge variant="outline" className="text-xs text-white border-white/30 bg-orange-500/20">
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </Badge>
            {lastSync && (
              <Badge variant="outline" className="text-xs text-white border-white/30">
                {lastSync.toLocaleTimeString()}
              </Badge>
            )}
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
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
            <TabsTrigger value="roteiro" className="flex items-center gap-2 text-xs sm:text-sm">
              <FileText className="w-4 h-4" />
              <span>Roteiro</span>
            </TabsTrigger>
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
            <TabsTrigger value="eventos-entregues" className="flex items-center gap-2 text-xs sm:text-sm">
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Eventos</span>
              <span>Entregues</span>
            </TabsTrigger>
          </TabsList>

          {/* ABA 1 - ROTEIRO */}
          <TabsContent value="roteiro" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Roteiro do Evento
                </CardTitle>
                <CardDescription>
                  Faça upload do roteiro ou digite diretamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome-evento">Nome do Evento *</Label>
                  <Input
                    id="nome-evento"
                    value={nomeEvento}
                    onChange={(e) => setNomeEvento(e.target.value)}
                    placeholder="Digite o nome do evento"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Upload de Roteiro</Label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,.pdf,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Escolher Arquivo
                    </Button>
                    {arquivoRoteiro && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {arquivoRoteiro.name}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roteiro-texto">Roteiro do Evento</Label>
                  <Textarea
                    id="roteiro-texto"
                    value={roteiroTexto}
                    onChange={(e) => setRoteiroTexto(e.target.value)}
                    placeholder="Digite ou cole o roteiro do evento aqui..."
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>

                {roteiroTexto && nomeEvento && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={finalizarEvento}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold flex items-center gap-2"
                      size="lg"
                    >
                      <CheckCircle className="w-5 h-5" />
                      👉 EVENTO CONCLUÍDO
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 2 - LISTA DE AUTORIDADES */}
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
                      <span className="text-orange-600 ml-2">• Modo Offline</span>
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
                              onValueChange={(value: 'Federal' | 'Estadual' | 'Municipal') => setNovaAutoridade(prev => ({ ...prev, nivelFederativo: value }))}
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
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outras abas continuam igual... */}
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
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dispositivo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Dispositivo Oficial
                </CardTitle>
                <CardDescription>
                  Ordem de precedência - {autoridadesDispositivo.length} no dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {autoridadesDispositivo.map((autoridade, index) => (
                      <SortableItem key={autoridade.id} autoridade={autoridade} index={index}>
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
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="falas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Ordem das Falas
                </CardTitle>
                <CardDescription>
                  Ordem das falas - menor para maior autoridade - {autoridadesFala.length} oradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {autoridadesFala.map((autoridade, index) => (
                      <SortableItem key={autoridade.id} autoridade={autoridade} index={index}>
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
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eventos-entregues" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Eventos Entregues
                </CardTitle>
                <CardDescription>
                  Histórico de eventos finalizados ({eventosEntregues.length} eventos)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {eventosEntregues.map((evento) => (
                      <div key={evento.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{evento.nome}</h4>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {evento.data}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{evento.historico_presenca.length} presentes</span>
                            <span>{evento.composicao_dispositivo.length} no dispositivo</span>
                            <span>{evento.falas_registradas.length} oradores</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEventoSelecionado(evento);
                              setDialogEventoAberto(true);
                            }}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportarPDF(evento)}
                            className="flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Exportar
                          </Button>
                        </div>
                      </div>
                    ))}
                    {eventosEntregues.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum evento finalizado ainda</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Dialog open={dialogEventoAberto} onOpenChange={setDialogEventoAberto}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    {eventoSelecionado?.nome}
                  </DialogTitle>
                  <DialogDescription>
                    Evento realizado em {eventoSelecionado?.data}
                  </DialogDescription>
                </DialogHeader>
                {eventoSelecionado && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Roteiro
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm font-mono">
                          {eventoSelecionado.roteiro}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Histórico de Presença ({eventoSelecionado.historico_presenca.length})
                      </h3>
                      <div className="space-y-2">
                        {eventoSelecionado.historico_presenca.map((autoridade, index) => (
                          <div key={autoridade.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <Badge variant="outline" className="min-w-[24px] h-5 flex items-center justify-center text-xs">
                              {index + 1}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{autoridade.nome}</p>
                              <p className="text-xs text-gray-600">{autoridade.cargo} - {autoridade.orgao}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => exportarPDF(eventoSelecionado)}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Exportar em PDF
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}