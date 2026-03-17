# Sindapp - Sistema Sindical Petshop

O Sindapp é uma plataforma moderna e escalável desenvolvida para centralizar a comunicação e os benefícios do sindicato dos trabalhadores do setor petshop.

## 🚀 Tecnologias

- **Frontend:** Next.js 14 (Simulado em Vite), React 19, TypeScript, TailwindCSS
- **Backend:** Firebase (Auth, Firestore, Storage, FCM)
- **Animações:** Framer Motion
- **Ícones:** Lucide React
- **PWA:** Preparado para Progressive Web App

## 🏗️ Arquitetura

O projeto segue uma estrutura modular e profissional:

- `src/app`: Rotas e páginas principais.
- `src/components`: Componentes reutilizáveis e módulos do sistema.
- `src/firebase`: Configuração e serviços do Firebase.
- `src/hooks`: Hooks customizados (Auth, etc).
- `src/types`: Definições de tipos TypeScript.
- `src/services`: Lógica de negócio e integração com APIs.

## 👥 Níveis de Acesso (RBAC)

1. **Gestão Sindpetshop:** Controle total, gestão de usuários e relatórios.
2. **Administração:** Suporte, moderação e publicação de conteúdos.
3. **Diretoria:** Acesso exclusivo à agenda institucional privada.
4. **Associados:** Acesso a benefícios, notícias e comunicados (após validação).

## 🛠️ Configuração Firebase

O sistema utiliza:
- **Firestore:** Banco de dados NoSQL com regras de segurança granulares.
- **Authentication:** Login via Google (expansível).
- **Storage:** Armazenamento de documentos e comprovantes de associados.
- **FCM:** Notificações push para comunicados importantes.

## 📦 Como rodar o projeto

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure as variáveis de ambiente no arquivo `.env`.
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🚢 Deploy (Vercel)

1. Conecte seu repositório GitHub à Vercel.
2. Adicione as variáveis de ambiente do Firebase.
3. A Vercel detectará automaticamente as configurações do Next.js/Vite.
4. O deploy será realizado automaticamente a cada push na branch principal.

## 📱 PWA

O sistema já conta com `manifest.json` e está preparado para instalação em dispositivos móveis, permitindo o uso como um aplicativo nativo.

---
Desenvolvido para **Sindpetshop**.
