'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Markdown extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Markdown.belongsTo(models.User, { foreignKey: 'doctorid' })

        }
    };
    Markdown.init({
        contentHTML: DataTypes.TEXT('long'),
        contentMarkdown: DataTypes.TEXT('long'),
        description: DataTypes.TEXT('long'),
        doctorid: DataTypes.INTEGER,
        specialtyid: DataTypes.INTEGER,
        clinicid: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Markdown',
    });
    return Markdown;
};