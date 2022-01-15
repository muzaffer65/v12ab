const discord = require("discord.js");
const fs = require("fs");
const http = require("http");
const db = require("quick.db");
const moment = require("moment");
const express = require("express");
const ayarlar = require("./ayarlar.json");
const app = express();
moment.locale("tr");

//READY.JS

const Discord = require("discord.js");
const client = new Discord.Client();
const logs = require("discord-logs");

logs(client);
client.on("ready", async () => {
  client.appInfo = await client.fetchApplication();
  setInterval(async () => {
    client.appInfo = await client.fetchApplication();
  }, 600);

  client.user.setActivity(``, { type: "WATCHING" });

  console.log("CodeWork Akıyor!!");
});

const log = (message) => {
  console.log(` ${message}`);
};
require("./util/eventLoader.js")(client);

//READY.JS SON

//KOMUT ALGILAYICI

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach((f) => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach((alias) => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = (command) => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach((alias) => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = (command) => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach((alias) => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = (command) => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

//KOMUT ALGILAYICI SON

client.elevation = (message) => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};
client.login(process.env.TOKEN);

//-----------------------KOMUTLAR-----------------------\\

//KULLANICI KAYIT MESAJI\\
/*
client.on("guildMemberAdd", async member => {
  let hgmesajı = db.fetch(`kgirismesajı_${member.guild.id}`);
  client.channels.cache
    .get(hgmesajı)
    .send(`Hoşgeldin ${member} Kayıt Olmak İçin !kayıt İsim Yaş`);
});

//KULLANICI KAYIT MESAJI SON\\

//YETKİLİ KAYIT MESAJI\\

client.on("guildMemberAdd", async member => {
  let yetkilihgmesajı = db.fetch(`yetkilikgirismesajı_${member.guild.id}`);
  client.channels.cache
    .get(yetkilihgmesajı)
    .send(
      `Hoşgeldin ${member} Kayıt Olmak İçin Kayıt Kanalına İsmini Yaz Ve Yetkilileri Bekle!`
    );
});

//YETKİLİ KAYIT MESAJI SON\\*/
Date.prototype.toTurkishFormatDate = function (format) {
  let date = this,
    day = date.getDate(),
    weekDay = date.getDay(),
    month = date.getMonth(),
    year = date.getFullYear(),
    hours = date.getHours(),
    minutes = date.getMinutes(),
    seconds = date.getSeconds();

  let monthNames = new Array(
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık"
  );
  let dayNames = new Array(
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi"
  );

  if (!format) {
    format = "yyyy dd MM hh:ii:ss";
  }
  format = format.replace("mm", month.toString().padStart(2, "0"));
  format = format.replace("MM", monthNames[month]);

  if (format.indexOf("yyyy") > -1) {
    format = format.replace("yyyy", year.toString());
  } else if (format.indexOf("yy") > -1) {
    format = format.replace("yy", year.toString().substr(2, 2));
  }

  format = format.replace("dd", day.toString().padStart(2, "0"));
  format = format.replace("DD", dayNames[weekDay]);

  if (format.indexOf("HH") > -1)
    format = format.replace("HH", hours.toString().replace(/^(\d)$/, "0$1"));
  if (format.indexOf("hh") > -1) {
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    format = format.replace("hh", hours.toString().replace(/^(\d)$/, "0$1"));
  }
  if (format.indexOf("ii") > -1)
    format = format.replace("ii", minutes.toString().replace(/^(\d)$/, "0$1"));
  if (format.indexOf("ss") > -1)
    format = format.replace("ss", seconds.toString().replace(/^(\d)$/, "0$1"));
  return format;
};
client.on("guildMemberRoleAdd", async (member, role) => {
  let yetkili = await member.guild
    .fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" })
    .then((audit) => audit.entries.first());
  if (yetkili.executor.bot) return;
  let kanal = member.guild.channels.cache.get(ayarlar.Channels.rollog);
  kanal.send(
    `${member.user.tag} adlı kişiye ${yetkili.executor} kişisi ${role} rolünü verdi!`
  );
  db.push(`rollog.${member.id}`, {
    Zaman: Date.now(),
    Staff: yetkili.executor.id,
    Rol: role.id,
    Tip: "EKLEME",
  });
});
client.tarihHesapla = (date) => {
  const startedAt = Date.parse(date);

  var msecs = Math.abs(new Date() - startedAt);

  const years = Math.floor(msecs / (1000 * 60 * 60 * 24 * 365));

  msecs -= years * 1000 * 60 * 60 * 24 * 365;

  const months = Math.floor(msecs / (1000 * 60 * 60 * 24 * 30));

  msecs -= months * 1000 * 60 * 60 * 24 * 30;

  const weeks = Math.floor(msecs / (1000 * 60 * 60 * 24 * 7));

  msecs -= weeks * 1000 * 60 * 60 * 24 * 7;

  const days = Math.floor(msecs / (1000 * 60 * 60 * 24));

  msecs -= days * 1000 * 60 * 60 * 24;

  const hours = Math.floor(msecs / (1000 * 60 * 60));

  msecs -= hours * 1000 * 60 * 60;

  const mins = Math.floor(msecs / (1000 * 60));

  msecs -= mins * 1000 * 60;

  const secs = Math.floor(msecs / 1000);

  msecs -= secs * 1000;

  var string = "";

  if (years > 0) string += `${days} gün`;
  else if (months > 0)
    string += `${months} ay ${weeks > 0 ? weeks + " hafta" : ""}`;
  else if (weeks > 0)
    string += `${weeks} hafta ${days > 0 ? days + " gün" : ""}`;
  else if (days > 0)
    string += `${days} gün ${hours > 0 ? hours + " saat" : ""}`;
  else if (hours > 0)
    string += `${hours} saat ${mins > 0 ? mins + " dakika" : ""}`;
  else if (mins > 0)
    string += `${mins} dakika ${secs > 0 ? secs + " saniye" : ""}`;
  else if (secs > 0) string += `${secs} saniye`;
  else string += `saniyeler`;

  string = string.trim();

  return `\`${string} önce\``;
};
client.on("guildMemberRoleRemove", async (member, role) => {
  let yetkili = await member.guild

    .fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" })

    .then((audit) => audit.entries.first());
  if (yetkili.executor.bot) return;
  let kanal = member.guild.channels.cache.get(ayarlar.Channels.rollog);

  kanal.send(
    `${member.user.tag} adlı kişisinden ${yetkili.executor} kişisi ${role} rolünü alındı!`
  );
  db.push(`rollog.${member.id}`, {
    Zaman: Date.now(),
    Staff: yetkili.executor.id,
    Rol: role.id,
    Tip: "KALDIRMA",
  });
});

const invites = {};

const wait = require("util").promisify(setTimeout);

client.on("ready", () => {
  wait(1000);

  client.guilds.cache.forEach((g) => {
    g.fetchInvites().then((guildInvites) => {
      invites[g.id] = guildInvites;
    });
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const regChannel = "831809116200239124"; // Kayıt kanalı

const inviteLog = "831809116200239125"; // Davet logunun gönderileceği kanal

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

client.on("guildMemberAdd", (member) => {
  if (member.user.bot) return;

  const user = client.users.cache.get(member.id);

  member.guild.fetchInvites().then(async (guildInvites) => {
    const ei = invites[member.guild.id];

    invites[member.guild.id] = guildInvites;

    const veri = await guildInvites.find(
      (i) =>
        (ei.get(i.code) == null ? i.uses - 1 : ei.get(i.code).uses) < i.uses
    );

    var daveteden;

    if (!veri) daveteden = "Bulunamadı";
    else daveteden = member.guild.members.cache.get(veri);

    var b = veri.guild.vanityURLCode;

    if (!b) b = veri.code;

    if (veri.code == b)
      daveteden = member.guild.members.cache.get(veri.inviter.id);
    else daveteden = member.guild;

    db.add(`davetsayi.${daveteden.id}.${member.guild.id}`, +1);

    db.add(`toplam.${daveteden.id}.${member.guild.id}`, +1);

    db.push(`günlük.${daveteden.id}.${member.guild.id}`, {
      userID: member.user.id,
    });

    let zaman = require("moment").duration(
      new Date().getTime() -
        client.users.cache.get(member.id).createdAt.getTime()
    );

    if (zaman < 604800017) {
      db.add(`davetsayi.${daveteden.id}.${member.guild.id}`, -1);

      db.add(`fake.${daveteden.id}_${member.guild.id}`, +1);
    }

    //Niwren was here!

    db.set(`veri.${member.id}.${member.guild.id}`, daveteden.id);

    //Niwren was here!

    let a = await db.fetch(`davetsayi.${daveteden.id}.${member.guild.id}`);

    //Niwren was here!

    let davetsayi;

    if (!a) {
      davetsayi = 0;
    } else {
      davetsayi = await db.fetch(
        `davetsayi.${daveteden.id}.${member.guild.id}`
      );
    }

    var y;

    if (daveteden.id == member.guild.id) y = "Özel URL";
    else y = daveteden.user.tag;

    let toplamüye = member.guild.memberCount;

    let memberDay = Date.now() - member.user.createdTimestamp;

    let createAt = moment.duration(memberDay).format("DD [Gün]");

    let createAt2 = moment.duration(memberDay).format("DD [gün önce]");

    if (zaman < 1296000000) {
      client.guild.members.cache
        .get(member.id)
        .roles.set(client.config.karantinaRoles);

      member.guild.channels.cache
        .get(regChannel)
        .send(
          new Discord.MessageEmbed()
            .setColor("#ff0000")

            .setAuthor(
              member.user.username,
              member.user.avatarURL({ dynamic: true })
            )

            .setDescription(
              `${member}, Adlı Kullanıcı Sunucuya Katıldı Hesabı **${createAt2}** Önce Açıldığı İçin Şüpheli!`
            )

            .setTimestamp()

            .setFooter(`${y} tarafından davet edildi`)
        )

        .setThumbnail(member.user.avatarURL({ dynamic: true }));

      member.guild.channels.cache
        .get(inviteLog)
        .send(
          `\`📥\` ${member} sunucuya katıldı! Davet eden: ${y} (${
            davetsayi ? davetsayi : "0"
          } davet) \`❌\``
        );
    } else {
      member.guild.channels.cache.get(regChannel).send(`:tada:  \`${
        member.guild.name
      }\` sunucusuna hoş geldin ${member} ! 

Hesabın ${new Date(
        member.user.createdAt
      ).toTurkishFormatDate()} (\`${createAt2}\`) oluşturulmuş. 

Sunucu kurallarımız <#831809116200239133> kanalında belirtilmiştir. Unutma sunucu içerisinde ki ceza işlemlerin kuralları okuduğunu varsayarak gerçekleştirilecek.

Tagımızı (\`₮\`) alarak bizlere destek olabilirsin! Kayıt olmak için teyit odalarına girip ses teyit vermen gerekiyor yetkililerimiz seninle ilgilenecektir! İyi eğlenceler.

${daveteden} **${davetsayi}.** davetini gerçekleştirerek sunucumuzun **${toplamüye}** kişi olmasını sağladı... 🎉🎉🎉
`);
      member.roles.add("831809115709243440");
      member.guild.channels.cache
        .get(inviteLog)
        .send(
          `\`📥\` ${member} sunucuya katıldı! Davet eden: ${y} (${
            davetsayi ? davetsayi : "0"
          } davet) \`✔️\``
        );
    }
  });
});

client.on("guildMemberRemove", async (member) => {
  const user = client.users.cache.get(member.id);

  member.guild.fetchInvites().then(async (guildInvites) => {
    const veri = await db.fetch(`veri.${member.id}.${member.guild.id}`);

    var daveteden;

    if (!veri) daveteden = "Bulunamadı";
    else daveteden = member.guild.members.cache.get(veri);

    let zaman = require("moment").duration(
      new Date().getTime() -
        client.users.cache.get(member.id).createdAt.getTime()
    );

    if (zaman < 1296000000) {
      db.add(`fake.${daveteden.id}.${member.guild.id}`, -1);

      db.add(`davetsayi.${daveteden.id}.${member.guild.id}`, -1);

      if (veri) {
        db.delete(`veri.${member.id}.${member.guild.id}`);
      }
    } else {
      db.add(`davetsayi.${daveteden.id}.${member.guild.id}`, -1);

      if (veri) {
        db.delete(`veri.${member.id}.${member.guild.id}`);
      }
    }

    var y;

    if (daveteden.id == member.guild.id) y = "Özel URL";
    else y = daveteden.user.tag;

    const davetsayi = await db.fetch(
      `davetsayi.${daveteden.id}.${member.guild.id}`
    );

    if (zaman < 1296000000) {
      if (!veri) {
        return member.guild.channels.cache
          .get(inviteLog)
          .send(
            `\`📤\` \`${member.user.username}\` çıktı. **Davet eden:** Bulunamadı \`❌\` `
          );
      } else if (daveteden.id == member.guild.id) {
        member.guild.channels.cache
          .get(inviteLog)
          .send(
            `\`📤\` \`${
              member.user.username
            }\`, sunucudan çıkış yaptı. **Davet eden:** ${y}, ${
              davetsayi ? davetsayi : "0"
            } daveti kaldı \`❌\``
          );
      } else {
        member.guild.channels.cache
          .get(inviteLog)
          .send(
            `\`📤\` \`${
              member.user.username
            }\`, sunucudan çıkış yaptı. **Davet eden:** ${y}, ${
              davetsayi ? davetsayi : "0"
            } daveti kaldı \`❌\``
          );
      }
    } else {
      {
        if (!veri) {
          return member.guild.channels
            .get(inviteLog)
            .send(
              `\`📤\` \`${member.user.username}\` çıktı, **Davet eden:** Bulunamadı \`❌\``
            );
        } else if (daveteden.id == member.guild.id) {
          member.guild.channels.cache
            .get(inviteLog)
            .send(
              `\`📤\` \`${
                member.user.username
              }\`, çıktı. **Davet eden:** ${y}, ${
                davetsayi ? davetsayi : "0"
              } daveti kaldı \`❌\``
            );
        } else {
          member.guild.channels.cache
            .get(inviteLog)
            .send(
              `\`📤\` \`${
                member.user.username
              }\`, çıktı. **Davet eden:** ${y}, ${
                davetsayi ? davetsayi : "0"
              } daveti kaldı \`❌\``
            );
        }
      }
    }
  });
}); /*
Date.prototype.toTurkishFormatDate = function(format) {
  let date = this,
    day = date.getDate(),
    weekDay = date.getDay(),
    month = date.getMonth(),
    year = date.getFullYear(),
    hours = date.getHours(),
    minutes = date.getMinutes(),
    seconds = date.getSeconds();

  let monthNames = new Array(
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık"
  );

  let dayNames = new Array(
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi"
  );

  if (!format) {
    format = "dd MM yyyy | hh:ii:ss";
  }

  format = format.replace("mm", month.toString().padStart(2, "0"));

  format = format.replace("MM", monthNames[month]);

  if (format.indexOf("yyyy") > -1) {
    format = format.replace("yyyy", year.toString());
  } else if (format.indexOf("yy") > -1) {
    format = format.replace("yy", year.toString().substr(2, 2));
  }

  format = format.replace("dd", day.toString().padStart(2, "0"));

  format = format.replace("DD", dayNames[weekDay]);

  if (format.indexOf("HH") > -1)
    format = format.replace("HH", hours.toString().replace(/^(\d)$/, "0$1"));

  if (format.indexOf("hh") > -1) {
    if (hours > 12) hours -= 12;

    if (hours === 0) hours = 12;

    format = format.replace("hh", hours.toString().replace(/^(\d)$/, "0$1"));
  }

  if (format.indexOf("ii") > -1)
    format = format.replace("ii", minutes.toString().replace(/^(\d)$/, "0$1"));

  if (format.indexOf("ss") > -1)
    format = format.replace("ss", seconds.toString().replace(/^(\d)$/, "0$1"));

  return format;
};

client.tarihHesapla = date => {
  const startedAt = Date.parse(date);

  var msecs = Math.abs(new Date() - startedAt);

  const years = Math.floor(msecs / (1000 * 60 * 60 * 24 * 365));

  msecs -= years * 1000 * 60 * 60 * 24 * 365;

  const months = Math.floor(msecs / (1000 * 60 * 60 * 24 * 30));

  msecs -= months * 1000 * 60 * 60 * 24 * 30;

  const weeks = Math.floor(msecs / (1000 * 60 * 60 * 24 * 7));

  msecs -= weeks * 1000 * 60 * 60 * 24 * 7;

  const days = Math.floor(msecs / (1000 * 60 * 60 * 24));

  msecs -= days * 1000 * 60 * 60 * 24;

  const hours = Math.floor(msecs / (1000 * 60 * 60));

  msecs -= hours * 1000 * 60 * 60;

  const mins = Math.floor(msecs / (1000 * 60));

  msecs -= mins * 1000 * 60;

  const secs = Math.floor(msecs / 1000);

  msecs -= secs * 1000;

  var string = "";

  if (years > 0) string += `${years} yıl ${months} ay`;
  else if (months > 0)
    string += `${months} ay ${weeks > 0 ? weeks + " hafta" : ""}`;
  else if (weeks > 0)
    string += `${weeks} hafta ${days > 0 ? days + " gün" : ""}`;
  else if (days > 0)
    string += `${days} gün ${hours > 0 ? hours + " saat" : ""}`;
  else if (hours > 0)
    string += `${hours} saat ${mins > 0 ? mins + " dakika" : ""}`;
  else if (mins > 0)
    string += `${mins} dakika ${secs > 0 ? secs + " saniye" : ""}`;
  else if (secs > 0) string += `${secs} saniye`;
  else string += `saniyeler`;

  string = string.trim();

  return `\`${string} önce\``;
};

*/
client.on("message", async (message) => {
  if (message.member.id !== ["529708524649840660", "703145709888733195"])
    return; // kişinin ID'si

  message.channel.send(`Hoş geldin ${message.author}!`);
});
