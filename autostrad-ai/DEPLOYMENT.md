# 🌐 Деплой AutostradAI на OpenServer

## ✅ Production-сборка готова

Файлы находятся в папке `dist/`:
- `index.html` - главная страница
- `assets/` - JS, CSS и другие ресурсы
- Общий размер: ~840 KB

## 📋 Инструкция по деплою на OpenServer

### Шаг 1: Скопировать файлы

Скопируйте содержимое папки `dist/` в корень вашего домена на OpenServer:

```bash
# Из текущей папки
cp -r dist/* D:/server/OpenServer/domains/AutostradAI/www/
```

Или вручную:
1. Откройте папку `D:\server\OpenServer\domains\AutostradAI\www\autostrad-ai\dist`
2. Скопируйте все файлы из `dist/`
3. Вставьте в `D:\server\OpenServer\domains\AutostradAI\www\`

### Шаг 2: Настроить виртуальный хост

1. Откройте OpenServer
2. Перейдите в **Настройки → Домены**
3. Убедитесь, что домен `autostradai.local` (или ваш домен) указывает на `D:\server\OpenServer\domains\AutostradAI\www`

### Шаг 3: Настроить .htaccess для SPA

Создайте файл `.htaccess` в корне домена:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Шаг 4: Открыть доступ из интернета

#### Вариант А: Через ngrok (быстро, для демо)

1. Скачайте ngrok: https://ngrok.com/download
2. Зарегистрируйтесь и получите authtoken
3. Запустите:
```bash
ngrok http 80
```
4. Получите публичный URL типа `https://xxxx-xx-xx-xx-xx.ngrok-free.app`

#### Вариант Б: Через локальный IP (в локальной сети)

1. Узнайте ваш локальный IP:
```bash
ipconfig
```
2. Откройте порт 80 в Windows Firewall
3. Доступ по адресу: `http://ваш-ip/`

#### Вариант В: Через внешний IP (постоянный доступ)

1. Узнайте ваш внешний IP: https://whatismyipaddress.com/
2. Настройте проброс портов (Port Forwarding) на роутере:
   - Внешний порт: 80 → Внутренний IP: ваш-локальный-ip:80
3. Настройте домен (если есть):
   - Купите домен на Namecheap/GoDaddy
   - Настройте A-запись на ваш внешний IP
4. Настройте HTTPS (опционально):
   - Используйте Let's Encrypt + Certbot

### Шаг 5: Проверить работу

1. Откройте браузер
2. Перейдите по адресу (в зависимости от выбранного варианта):
   - Локально: `http://localhost/`
   - Локальная сеть: `http://ваш-ip/`
   - Интернет: `http://ваш-домен/` или ngrok URL

## 🚀 Быстрый деплой через ngrok (рекомендуется для демо)

```bash
# 1. Скопировать файлы
cp -r dist/* ../

# 2. Скачать и установить ngrok
# https://ngrok.com/download

# 3. Запустить ngrok
ngrok http 80

# 4. Получить публичный URL
# Пример: https://1234-56-78-90-12.ngrok-free.app
```

## ⚠️ Важные замечания

### Для OpenServer:
- Убедитесь, что Apache запущен
- Проверьте, что порт 80 не занят другими приложениями
- Включите mod_rewrite в настройках Apache

### Для доступа из интернета:
- **ngrok** - самый простой способ для демонстрации
- **Внешний IP** - требует настройки роутера и может быть небезопасен
- **VPS/хостинг** - лучший вариант для продакшена (Vercel, Netlify)

### Безопасность:
- Не открывайте порты без необходимости
- Используйте HTTPS для продакшена
- Настройте firewall
- Регулярно обновляйте зависимости

## 📝 Альтернатива: Vercel (рекомендуется)

Если нужен постоянный доступ, лучше использовать Vercel:

```bash
# 1. Установить Vercel CLI
npm install -g vercel

# 2. Задеплоить
vercel

# 3. Получить URL
# Пример: https://autostrad-ai.vercel.app
```

Преимущества Vercel:
- ✅ Бесплатно
- ✅ Автоматический HTTPS
- ✅ CDN по всему миру
- ✅ Автоматические деплои из Git
- ✅ Не нужно настраивать сервер

---

**Выберите подходящий вариант и следуйте инструкциям!**
