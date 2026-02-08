---
description: Como fazer o deploy para o GitHub Pages
---

Para rodar o projeto no GitHub Pages, siga estes passos:

1. **Configuração do Repositório**:
   - Certifique-se de que seu código está em um repositório no GitHub.

2. **Verificação de Configurações** (Já realizado por mim):
   - O projeto agora utiliza `HashRouter` para evitar erros 404 ao atualizar a página.
   - O `vite.config.js` está configurado com `base: './'`.
   - O `package.json` possui os scripts de `deploy`.

3. **Executar o Deploy**:
   No terminal, execute o comando:
   ```bash
   npm run deploy
   ```
   Isso irá construir o projeto e enviar a pasta `dist` para a branch `gh-pages`.

4. **Configuração no GitHub**:
   - Vá para o seu repositório no GitHub.
   - Clique em **Settings** > **Pages**.
   - Em **Build and shipment**, verifique se a branch está definida como `gh-pages` e a pasta como `/ (root)`.

5. **Acessar o Site**:
   - O link aparecerá no topo da página de configurações do GitHub Pages (ex: `https://usuario.github.io/nome-do-repo/`).
