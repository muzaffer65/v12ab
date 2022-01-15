const Discord = require("discord.js");
const ayar = require("../ayarlar.json");
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
  if (
    !message.member.roles.cache.has(ayar.Authorization.Registers.Roles) &&
    !message.member.hasPermission("ADMINISTRATOR")
  ) {
    message.react(ayar.Emojis.iptal);
    return;
  }
  let uye =
    message.mentions.members.first() ||
    message.guild.members.cache.get(args[0]);
  args = args.filter(a => a !== "" && a !== " ").splice(1);
  let newName;
  let isim = args
    .filter(arg => isNaN(arg))
    .map(
      arg =>
        arg
          .charAt(0)
          .replace("i", "İ")
          .toUpperCase() + arg.slice(1)
    )
    .join(" ");
  let yaş = args.filter(arg => !isNaN(arg))[0] || undefined;
  if (!uye || !isim || !yaş) {
    message.channel
      .send(
        embed.setDescription(
          `**Lütfen tüm argümanları eksiksiz ve düzgün giriniz!** \`\`\`js\nÖrnek: ${ayar.prefix}erkek @Noxious/ID {yaş}\`\`\``
        )
      )
      .then(nox => nox.delete(6000));
    message.react(ayar.Emojis.iptal);
    return;
  }
  if (yaş <= ayar.Authorization.Registers.AgeLimit) {
    message.channel
      .send(
        embed.setDescription(
          `Hey! Bu sunucuda yaş sınırı \`${ayar.Authorization.Registers.AgeLimit}\` olarak belirtilmiştir! `
        )
      )
      .then(nox => nox.delete(6000));
    message.react(ayar.Emojis.iptal);
    return;
  }
};

exports.conf = {
  guildOnly: true,

  enabled: true,

  aliases: ["e"],

  permLvl: 0
};

exports.help = {
  name: "erkek",

  description: "taslak",

  usage: "taslak"
};
