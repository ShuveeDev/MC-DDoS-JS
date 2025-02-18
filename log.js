const mineflayer = require('mineflayer');
const fs = require('fs');

const SERVER_HOST = '0.0.0.0';
const SERVER_PORT = 25565;
const ACCOUNT_FILE = 'ddoser.json';
const MESSAGE = 't.me/galebrawll';
const MESSAGE_INTERVAL = 3000;

function loadAccounts() {
    try {
        const data = fs.readFileSync(ACCOUNT_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Помилка завантаження акаунтів:", err);
        return { accounts: [] };
    }
}

function createBot(account) {
    if (!account?.username || !account?.password) {
        console.error("Некоректний акаунт:", account);
        return;
    }

    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: account.username,
        version: '1.20'
    });

    bot.once('login', () => {
        console.log(`[${account.username}] Підключено. Виконую вхід...`);
        bot.chat(`/login ${account.password}`);
    });

    bot.once('spawn', () => {
        console.log(`[${account.username}] Спавнено. Починаю рух...`);

        
        bot.setControlState('forward', true);
        setTimeout(() => bot.setControlState('forward', false), 2000);

        setTimeout(() => {
            console.log(`[${account.username}] Починаю спам...`);
            startSpamming(bot, account.username);
        }, 1000); 
    });

    
    bot.on('message', (message) => {
        const msg = message.toString().toLowerCase();
        if (msg.includes('логін') || msg.includes('увійдіть') || msg.includes('password')) {
            console.log(`[${account.username}] Виявлено запит на логін.`);
            bot.chat(`/login ${account.password}`);
        }
    });

    bot.on('end', (reason) => {
        console.log(`[${account.username}] Відключено: ${reason}`);
    });

    bot.on('error', (err) => {
        console.log(`[${account.username}] Помилка: ${err.message}`);
    });
}

function startSpamming(bot, username) {
    const spamInterval = setInterval(() => {
        if (bot.entity && bot.connected) {
            bot.chat(MESSAGE);
            console.log(`[${username}] Відправлено: ${MESSAGE}`);
        } else {
            console.log(`[${username}] Бот не активний. Зупиняю спам.`);
            clearInterval(spamInterval);
        }
    }, MESSAGE_INTERVAL);
}

function startLogin() {
    const { accounts } = loadAccounts();
    console.log(`Знайдено ${accounts.length} акаунтів для авторизації`);

    accounts.forEach((account, index) => {
        setTimeout(() => {
            createBot(account);
        }, index * 500); 
    });
}

process.on('SIGINT', () => {
    console.log('\nЗавершення роботи...');
    process.exit();
});

startLogin();

