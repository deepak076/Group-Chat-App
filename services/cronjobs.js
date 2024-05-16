const { CronJob } = require('cron');
const { Op } = require('sequelize');
const ArchivedChat = require('../models/ArchivedChat');
const ChatMessage = require('../models/chatMessage');
const sequelize = require('../util/db');

const job = new CronJob(
    '0 0 * * *', // This runs the job every day at midnight
    archiveChatsAndDeleteOldChats,
    null,
    false,
    'Asia/Kolkata'
);

async function archiveChatsAndDeleteOldChats() {
    const transaction = await sequelize.transaction();
    try {
        const date = new Date();
        const oneDayBefore = new Date(date.setDate(date.getDate() - 1));

        const chatsToArchive = await ChatMessage.findAll({
            where: {
                updatedAt: {
                    [Op.lt]: oneDayBefore
                }
            },
            transaction
        });

        for (const chat of chatsToArchive) {
            await ArchivedChat.create({
                message: chat.message,
                userId: chat.userId,
                groupId: chat.groupId
            }, { transaction });

            await ChatMessage.destroy({
                where: { id: chat.id },
                transaction
            });
        }

        await transaction.commit();
        console.log('Chats archived and deleted successfully.');
    } catch (error) {
        console.error('Error in archiving and deleting old chats:', error.message);
        await transaction.rollback();
    }
}

module.exports = {
    job
};
