const { MessageEmbed } = require("discord.js");
const ayar = require("../ayarlar.json");
const db = require("quick.db");

exports.run = async (client, message, args) => {
  let jailLog = message.guild.channels.cache.get(ayar.Channels.jailLog);
  let puanLog = message.guild.channels.cache.get(ayar.Channels.puanLog);
  let embed = new MessageEmbed()
    .setAuthor(
      message.member.displayName,
      message.author.avatarURL({ dynamic: true })
    )
    .setFooter(client.user.username)
    .setColor("RANDOM")
    .setTimestamp();

  if (
    !message.member.roles.cache.has(ayar.Penal.Jail.AuthRole) &&
    !message.member.hasPermission("ADMINISTRATOR")
  ) {
    message.react(ayar.Emojis.iptal);
    return;
  }
  let uye =
    message.mentions.members.first() ||
    message.guild.members.cache.get(args[0]);
  let sebep = args.slice(1).join(" ");
  if (!uye && !sebep) {
    message.channel
      .send(
        embed.setDescription(
          `Lütfen tüm argümanları doğru giriniz! Örnek: \`${exports.help.usage}\``
        )
      )
      .then(m => m.delete({ timeout: 7000 }));

    message.react(ayar.Emojis.iptal);
    return;
  }
  let jaillimi = await db.get(`jail.${uye.id}.${message.guild.id}`);
  /*if (
    jaillimi == "jailli" ||
    message.member.roles.cache.has(ayar.Penal.Jail.Role)
  ) {
    message.channel
      .send(
        embed.setDescription(
          `🚫 ${uye} adlı üye zatenten jailde! jailden çıkartmak için \`.unjail {${uye.displayName.replace(
            "`",
            ""
          )}/${uye.id}} {sebep}\``
        )
      )
      .then(x => x.delete({ timeout: 5000 }));

    message.react(ayar.Emojis.iptal);
    return;
  }*/
  if (message.member.roles.highest.position <= uye.roles.highest.position) {
    message.channel
      .send(
        embed.setDescription(
          `Belirttiğin kişi senden üstün veya onunla aynı yetkidesin!`
        )
      )
      .then(x => x.delete({ timeout: 5000 }));
    message.react(ayar.Emojis.iptal);
    return;
  }
  await uye.roles
    .set(
      uye.roles.cache.has(ayar.OtherRoles.Booster)
        ? [ayar.Penal.Jail.Role, ayar.OtherRoles.Booster]
        : [ayar.Penal.Jail.Role]
    )
    .catch();

  let cezaID = db.get(`ceza.${message.guild.id}.no`) + 1;
  db.add(`ceza.${message.guild.id}.no`, +1);
  db.add(`ceza.${uye.id}.${message.guild.id}.puan`, +20);
  db.add(`staff.${message.author.id}.${message.guild.id}.jail`, +1);
  db.add(`user.${uye.id}.${message.guild.id}.jail`, +1);
  db.set(`jail.${uye.id}.${message.guild.id}`, "jailli");
  db.set(`cezaID.${cezaID}.${message.guild.id}.bilgi`, {
    staff: message.author.id,
    time: Date.now(),
    tip: "JAİL",
    reason: sebep,
    cezapuan: 20
  });
  db.push(`sicil.${uye.id}.${message.guild.id}`, {
    no: cezaID,
    staff: message.author.id,
    time: Date.now(),
    tip: "JAİL",
    reason: sebep,
    cezapuan: 20
  });
  let cpuan = await db.get(`ceza.${uye.id}.${message.guild.id}.puan`);
  if (cpuan > 150) {
    if (message.guild.channels.cache.has(ayar.Channels.jailLog))
      jailLog.send(
        `${uye} adlı üyesi **${cpuan}** ceza puanına ulaştığı için **cezalandırıldı!**`
      );
  }
  message.channel
    .send(
      `${uye} üyesi sunucudan **${sebep}** sebebiyle ${message.author} tarafından jail cezası yedi! **Ceza Numarası:** (\`#${cezaID}\`)`
    )

    .then(x => x.delete({ timeout: 10000 }));
  message.react(ayar.Emojis.tik);
  puanLog.send(
    `${uye} aldığınız \`#${cezaID}\` ID'li ceza ile **${cpuan ||
      20}** ceza puanına ulaştınız.`
  );
  jailLog.send(
    embed.setDescription(`**${uye} üyesine ${message.guild.roles.cache.get(
      ayar.Penal.Jail.Role
    )} rolü verildi!**
  
• Ceza ID: \`#${cezaID}\`
• Cezalandırılan Üye: ${uye} (\`${uye.id}\`)
• Cezalandıran Yetkili:  ${message.author} (\`${message.author.id}\`)
• Ceza Tarihi: ${new Date(Date.now()).toTurkishFormatDate()} 
• Ceza Sebebi: \`${sebep}\``)
  );
};

exports.conf = {
  guildOnly: true,

  enabled: true,

  aliases: [],

  permLvl: 0
};

exports.help = {
  name: "jail",

  description: "taslak",

  usage: ".jail {üye(@Noxious/ID)} {sebep}"
};
