# 🏗️ Canteiro - Gestão de Ferramentas de Construção

<div align="center">
  <!-- <img src="assets/icon.png" alt="Canteiro Logo" width="120" height="120" /> -->
  
  **Sistema completo de gestão de ferramentas para canteiros de obra**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.74-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-51-black.svg)](https://expo.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

## 📱 Sobre o Projeto

O **Canteiro** é um aplicativo mobile desenvolvido especificamente para o mercado brasileiro de construção civil, oferecendo uma solução completa para gestão de ferramentas e equipamentos em canteiros de obra.

### 🎯 Principais Funcionalidades

- **📊 Dashboard Inteligente** - Visão geral com estatísticas em tempo real
- **🔧 Gestão de Ferramentas** - Cadastro, listagem e controle completo
- **📝 Atividades Recentes** - Histórico detalhado de movimentações
- **👥 Controle de Usuários** - Sistema de perfis e permissões
- **🏢 Multi-empresa** - Suporte a múltiplas construtoras
- **📱 Interface Moderna** - Design responsivo e intuitivo
- **🔍 Busca e Filtros** - Localização rápida de ferramentas
- **⚡ Tempo Real** - Sincronização instantânea entre dispositivos

## 🚀 Tecnologias Utilizadas

### Frontend
- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma de desenvolvimento e deploy
- **TypeScript** - Tipagem estática para JavaScript
- **Expo Router** - Navegação baseada em arquivos
- **NativeWind** - Tailwind CSS para React Native
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança a nível de linha
- **Real-time Subscriptions** - Atualizações em tempo real

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **npm** ou **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Conta no Supabase** (gratuita)

## ⚙️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/GersonRocha9/canteiro-app.git
cd canteiro-app
```

### 2. Instale as dependências
```bash
yarn install
# ou
npm install
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Crie um arquivo `.env` na raiz do projeto
3. Adicione suas credenciais do Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

> 💡 **Dica**: Encontre essas informações em Settings > API no painel do Supabase

### 4. Configure o banco de dados

Execute o arquivo SQL no Supabase SQL Editor:

```bash
# Copie o conteúdo de canteiro_setup_completo.sql
# Cole no SQL Editor do Supabase e execute
```

### 5. Execute o aplicativo

```bash
yarn start
# ou
npm start
```

## 🏗️ Estrutura do Projeto

```
canteiro-app/
├── app/                          # Telas do aplicativo (Expo Router)
│   ├── (protected)/             # Área protegida (logado)
│   │   ├── (tabs)/              # Navegação por abas
│   │   │   ├── index.tsx        # Dashboard
│   │   │   ├── tools.tsx        # Listagem de ferramentas
│   │   │   ├── add-tool.tsx     # Cadastro de ferramentas
│   │   │   └── profile.tsx      # Perfil do usuário
│   │   ├── activities.tsx       # Atividades recentes
│   │   ├── tool-details.tsx     # Detalhes da ferramenta
│   │   └── modal.tsx           # Tela modal
│   ├── welcome.tsx             # Tela de boas-vindas
│   ├── sign-up.tsx            # Cadastro
│   └── sign-in.tsx            # Login
├── components/                 # Componentes reutilizáveis
│   ├── ui/                    # Componentes de UI base
│   └── safe-area-view.tsx     # SafeAreaView customizado
├── hooks/                     # Hooks customizados
│   ├── useDashboard.ts       # Hook do dashboard
│   ├── useProfile.ts         # Hook do perfil
│   ├── useTools.ts           # Hook das ferramentas
│   └── useActivities.ts      # Hook das atividades
├── context/                  # Contextos React
│   └── supabase-provider.tsx # Provider de autenticação
├── types/                    # Tipos TypeScript
│   └── database.types.ts     # Tipos do banco de dados
├── config/                   # Configurações
│   └── supabase.ts          # Cliente Supabase
└── canteiro_setup_completo.sql # Setup do banco de dados
```

## 🎨 Design System

O app utiliza um design system consistente baseado em:

- **Cores**: Paleta profissional para construção civil
- **Tipografia**: Hierarquia clara e legível
- **Componentes**: Biblioteca reutilizável de UI
- **Ícones**: Material Icons para consistência
- **Espaçamento**: Sistema baseado em múltiplos de 4px

## 👥 Tipos de Usuário

### Roles Disponíveis:
- **👨‍💼 Admin** - Acesso total ao sistema
- **👷‍♂️ Encarregado** - Gestão de ferramentas e equipe
- **🔨 Mestre de Obras** - Supervisão e controle
- **📦 Almoxarife** - Controle de estoque
- **⚒️ Operário** - Uso básico de ferramentas

## 🔐 Segurança

- **Autenticação** via Supabase Auth
- **Row Level Security (RLS)** no banco de dados
- **Políticas de acesso** por empresa e role
- **Validação** de dados no frontend e backend
- **Criptografia** de dados sensíveis

## 📊 Funcionalidades Detalhadas

### Dashboard
- Estatísticas em tempo real
- Gráficos de utilização
- Atividades recentes
- Ações rápidas

### Gestão de Ferramentas
- Cadastro completo com fotos
- QR Code para identificação
- Controle de localização
- Histórico de movimentações
- Status em tempo real

### Atividades
- Log completo de ações
- Filtros por tipo e período
- Busca avançada
- Exportação de relatórios

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: gersonrocha9@gmail.com
- **Issues**: [GitHub Issues](https://github.com/GersonRocha9/canteiro-app/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/GersonRocha9/canteiro-app/wiki)

---

<div align="center">
  Desenvolvido com ❤️ para a construção civil brasileira
</div>
