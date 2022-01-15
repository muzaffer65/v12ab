const Discord = require("discord.js");
const moment = require("moment");

require("moment-duration-format");
const db = require("quick.db");
exports.run = async (client, message, args) => {
  let embed = new Discord.MessageEmbed()
    .setAuthor(
      message.member.displayName,
      message.author.avatarURL({ dynamic: true })
    )
    .setFooter(client.user.username)
    .setColor("RANDOM")
    .setTimestamp();
  let kullanici =
    message.mentions.users.first() ||
    client.users.cache.get(args[0]) ||
    (args.length > 0
      ? client.users.cache
          .filter(e =>
            e.username.toLowerCase().includes(args.join(" ").toLowerCase())
          )
          .first()
      : message.author) ||
    message.author;
  let uye = message.guild.member(kullanici);

  let rollog = db.get(`rollog.${uye.id}`) || [];
  rollog = rollog.reverse();
  let listedrol =
    rollog.length > 0
      ? rollog
          .map(
            (value, index) =>
              `**Yetkili:** ${message.guild.member(value.Staff)}
**Rol:** ${message.guild.roles.cache.get(value.Rol)}
**Tarih:** \`${moment(value.Zaman).format('DD/MM HH:mm')}\`
**Tip:** \`${value.Tip}\``
          )
          .join("\n━━━━━━━━━━━━\n")
      : "Bulunmuyor!";
  message.channel.send(
    embed.setDescription(
      `${uye} kişisinin toplamda **${rollog.length}** rol bilgisi bulunmakta, son 10 rol bilgileri aşağıda belirtilmişdir.\n\n${listedrol}`
    )
  );
};

exports.conf = {
  guildOnly: true,

  enabled: true,

  aliases: ["rollog"],

  permLvl: 0
};

exports.help = {
  name: "rol-log",

  description: "taslak",

  usage: "taslak"
};
