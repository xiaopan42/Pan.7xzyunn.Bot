import express from 'express';
import session from 'express-session';
import passport from 'passport';
import bodyParser from 'body-parser';
import fs from 'fs';
import { Strategy as DiscordStrategy } from 'passport-discord';
import dotenv from 'dotenv';
dotenv.config();

export function startWeb(client) {
  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', './src/web/views');

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Discord 登入策略
  passport.use(new DiscordStrategy({
    clientID: process.env.APPLICATION_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: ['identify', 'guilds'],
  }, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }));

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  // 登入 / 登出
  app.get('/login', passport.authenticate('discord'));
  app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
    console.log(`✅ 使用者登入：${req.user.username}`);
    res.redirect('/dashboard');
  });
  app.get('/logout', (req, res) => req.logout(() => res.redirect('/')));

  function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/');
  }

  // 首頁
  app.get('/', (req, res) => {
    res.render('index', { user: req.user });
  });

  // 控制面板
  app.get('/dashboard', checkAuth, async (req, res) => {
    if (!req.user?.guilds) {
      return res.send(`
        <h2>⚠️ 無法取得伺服器清單</h2>
        <p>請 <a href="/logout">登出</a> 後重新登入，並確認授權包含 <code>guilds</code> 權限。</p>
      `);
    }

    const botGuilds = client.guilds.cache;
    const userGuilds = req.user.guilds.filter(g => (g.permissions & 0x20) === 0x20);
    const mutualGuilds = userGuilds.filter(g => botGuilds.has(g.id));

    res.render('dashboard', { user: req.user, guilds: mutualGuilds });
  });

  // 伺服器設定頁
  app.get('/dashboard/:guildId', checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.send('機器人未加入此伺服器。');

    const settings = JSON.parse(fs.readFileSync('./src/web/data/settings.json', 'utf-8'));
    const current = settings[guild.id] || {};
    const textChannels = guild.channels.cache.filter(c => c.isTextBased() && c.type === 0);

    res.render('guild', { guild, channels: textChannels, current });
  });

  // 儲存設定
  app.post('/dashboard/:guildId', checkAuth, (req, res) => {
    const { logChannel } = req.body;
    const guildId = req.params.guildId;
    const settings = JSON.parse(fs.readFileSync('./src/web/data/settings.json', 'utf-8'));

    settings[guildId] = { logChannel };
    fs.writeFileSync('./src/web/data/settings.json', JSON.stringify(settings, null, 2));

    res.redirect(`/dashboard/${guildId}`);
  });

  const PORT = process.env.WEB_PORT || 3000;
  app.listen(PORT, () => console.log(`🌐 控制面板已啟動：http://localhost:${PORT}`));
}
