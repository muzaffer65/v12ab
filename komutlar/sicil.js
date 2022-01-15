const Discord = require("discord.js");

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
  let sicil = db.get(`sicil.${uye.id}.${message.guild.id}`) || [];
  let listedPenal =
    sicil.length > 0
      ? sicil
          .map(
            (value, index) =>
              `\`#${value.no}\` **[${value.tip}]** \`${new Date(
                value.time
              ).toTurkishFormatDate()}\` tarihinde **${
                value.reason || "Sebep Belirtilmemiş!"
              }** nedeniyle ${
                message.guild.members.cache.has(value.staff)
                  ? message.guild.members.cache.get(value.staff)
                  : value.mod
              } tarafından cezalandırıldı ve **${
                value.cezapuan
              }** ceza puanı eklendi!`
          )
          .join("\n")
      : "Temiz!";
  sicil = sicil.reverse();
  let durum = "✅  Güvenli";
  if (sicil.lenght > 10) durum = "🚫 Tehlikeli!";
  if (sicil.lenght < 10) durum = "✅  Güvenli!";
  message.channel.send(
    embed
      .setDescription(
        `${message.guild.name} sunucusunda ${uye} kullanıcısının tüm cezaları aşağıda listelenmiştir.`
      )
      .addField(
        `Son Ceza-i İşlemi`,
        `\`\`\`js\n${sicil

          .map(
            ceza => `
ID => ${ceza.no}
Yetkili => ${
              message.guild.members.cache.has(ceza.staff)
                ? message.guild.members.cache.get(ceza.staff).displayName
                : ceza.mod
            }
Puan => ${ceza.cezapuan}
Tür => ${ceza.tip}
Sebep => ${ceza.reason || "Sebep Belirtilmemiş!"}`
          )
          .slice(0, 1)}\n\`\`\``
      )

      .addField(
        `Son 10 Ceza-i İşlemler \`(Toplam: ${sicil.length} Ceza - ${durum})\``,
        listedPenal
      )
  );
};

exports.conf = {
  guildOnly: true,

  enabled: true,

  aliases: [],

  permLvl: 0
};

exports.help = {
  name: "sicil",

  description: "taslak",

  usage: "taslak"
};
