import { DataTypes, Model, Op, Optional } from "sequelize";
import connection from "../database";
import Sound from "./sound";
import Vote from "./votes";

interface votingSessionAttributes {
	id: number;
	sounds: string; // ["8bdb3bc5-52c2-4b54-abad-4ec8a711e9ad"]
	start: string; // 1 = first day of the week
	end: string; // end 2= second day of the week
}
export interface votingSessionInput
	extends Optional<votingSessionAttributes, "id" | "sounds" | "start" | "end"> {
	sounds: string;
	start: string;
	end: string;
}
export interface votingSesisonOutput
	extends Required<votingSessionAttributes> {}

class votingSession extends Model<votingSessionAttributes, votingSessionInput> {
	public id!: number;
	public sounds!: string;
	public start!: string;
	public end!: string;
	public expired!: boolean;
	public topfive!: object;

	isExpired(): boolean {
		if (new Date(this.end) < new Date()) return true;
		return false;
	}

	async getWinners(amount: number): Promise<object> {
		let votes = [];
		for (let sound of this.sounds) {
			votes.push({
				id: sound,
				votes: (
					await Vote.findAndCountAll({
						where: {
							session: this.id,
							sound: sound,
						},
					})
				).count,
			});
		}

		let sound = votes.reduce(function (max, obj) {
			return obj.votes > max.votes ? obj : max;
		});

		let row = await Sound.findOne({
			where: { id: sound.id },
			attributes: ["name", "votes", "id"],
		});

		// @ts-ignore
		row?.votes = sound.votes;

		return [row] || [];
	}
	// checks if the voting is happening at this moment
	isActive(): boolean {
		/// idk why tf it returns a date that was two hours ago.......
		// WARNING: might cause errors
		const now = new Date( Date.now() + 7_200_000 );
		if (new Date(this.start) < now && new Date(this.end) > now) return true;
		return false;
	}
}

export async function currentWeek() {
	// idk why i have to add +2 hours. idek and idegaf 
	const now = new Date( Date.now() + 7_200_000 );
	
	let week = await votingSession.findAll({
		  order: [
		    ['createdAt', 'DESC']
  		],
	});

	if (week) return week[1];
	return null;
}

votingSession.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		sounds: {
			type: DataTypes.JSONB,
			allowNull: false,
		},
		start: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		end: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		timestamps: true,
		sequelize: connection,
		freezeTableName: true,
	}
);

export default votingSession;
