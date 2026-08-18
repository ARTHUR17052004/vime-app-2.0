# COMO INICIAR O PROJETO VIME 2.0

## Sempre que desligar o computador

Abrir o VS Code.

Abrir a pasta:

```text
C:\PROJETOS\VIME APP 2.0
```

Abrir um terminal.

Entrar na pasta do frontend:

```bash
cd frontend
```

Iniciar o sistema:

```bash
npm run dev
```

Se tudo estiver correto aparecerá:

```text
Local: http://localhost:3000
Ready
```

Abrir no navegador:

```text
http://localhost:3000
```

---

## Erro comum

Se aparecer:

```text
Could not read package.json
```

Significa que o terminal está na pasta errada.

Entrar na pasta correta:

```bash
cd frontend ou cd backend

```

E executar novamente:

```bash
npm run dev
```

---

## Como parar o sistema

No terminal:

```bash
Ctrl + C
```

Confirmar:

```text
Y
```

---

## Status Atual

✅ Next.js instalado

✅ Tailwind configurado

✅ Sidebar criada

✅ Dashboard inicial criado

✅ Projeto rodando em localhost

Data: 12/06/2026


como iniciar o ssh no powershell

ssh root@129.121.49.155 -p 22022
senha: Britec2323@

cd /var/www/vime-app-2.0
git pull origin main
cd backend
npm install
set -a && source .env && set +a
npx prisma generate
pm2 restart vime-backend
cd ../frontend
npm install
npm run build
pm2 restart vime-frontend


acesso vimesistema.online
admin@vime.com
senha: 02102005

token de acesso meta:EAAPH7NNowyUBSRVreKuqOZCZAYyMRESuQSRfHMcTDcce9nwE0LHYGVuwzXK2SjbWvookJaYusX2NjO14MBg95baQLYPZC2hu7AQHzMZCHXTucr4VYpDBmUxqEhYZBDirqpX4qWoXkswV0YxQBmHfajYlDBAEZBsOWV5mqmtZCFBKMm5v2PQIDsdZCCzbqszEI85DjP1ZAS0vcHI3s4zqETMzgaQD3shJ2DPW9wSr7kApn8iIFYxJTEnFrohonyepSknWwtEdcd33yzMm5knPkQer3aFGUzT5RAv6cZBQZDZD