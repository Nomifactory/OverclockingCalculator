import { RecipeResult } from "./types/RecipeResult";
import { Recipe } from "./types/Recipe";

export const V = [8, 32, 128, 512, 2048, 8192, 32768, 131072, 524288, 2147483647];

export const VNames = ["ULV", "LV", "MV", "HV", "EV", "IV", "LuV", "ZPM", "UV", "MAX"];

export enum GTTiers {
	ULV = 0,
	LV,
	MV,
	HV,
	EV,
	IV,
	LuV,
	ZPM,
	UV,
	MAX,
}

export const getTierByVoltage = (voltage: number): number => {
	let tier = 0;
	while (++tier < V.length) {
		if (voltage == V[tier]) {
			return tier;
		} else if (voltage < V[tier]) {
			return Math.max(0, tier - 1);
		}
	}
	return Math.min(V.length - 1, tier);
};

const getByproductChanceMultiplier = (tier: number, recipe: Recipe) => {
	const recipeTier = getTierByVoltage(recipe.EUt);
	if (recipe.isMacerator) {
		if (tier >= GTTiers.MV) {
			return 1 << (tier - GTTiers.MV);
		}

		return 1;
	} else if (!recipe.isMacerator && tier > GTTiers.LV && tier > recipeTier) {
		return 1 << (tier - recipeTier);
	}
	return 1;
};

/*
https://github.com/GregTechCE/GregTech/blob/master/src/main/java/gregtech/api/capability/impl/AbstractRecipeLogic.java#L239
*/
const calculateOverclockInternal = (EUt: number, voltage: number, duration: number) => {
	const negativeEU = EUt < 0;
	const tier = getTierByVoltage(voltage);
	if (V[tier] <= EUt || tier == 0) return [EUt, duration];
	if (negativeEU) EUt = -EUt;
	if (EUt <= 16) {
		const multiplier = EUt <= 8 ? tier : tier - 1;
		const resultEUt = EUt * (1 << multiplier) * (1 << multiplier);
		const resultDuration = duration / (1 << multiplier);
		return [negativeEU ? -resultEUt : resultEUt, Math.floor(resultDuration)];
	}

	let resultEUt = EUt;
	let resultDuration = duration;
	//do not overclock further if duration is already too small
	while (resultDuration >= 3 && resultEUt <= V[tier - 1]) {
		resultEUt *= 4;
		resultDuration /= 2.8;
	}
	return [negativeEU ? -resultEUt : resultEUt, Math.ceil(resultDuration)];
};

export const calculateOverclock = (recipe: Recipe): RecipeResult[] => {
	let tier = 0;
	let voltage = 0;
	let waste = false;

	const duration = recipe.seconds ? recipe.duration * 20 : recipe.duration;

	const output: RecipeResult[] = [];
	while (voltage < V[V.length - 1]) {
		voltage += V[tier];
		if (voltage == V[tier + 1]) {
			tier++;
		}

		const result = calculateOverclockInternal(recipe.EUt, voltage, duration);
		if (voltage / V[tier] == 1 && voltage >= recipe.EUt) {
			if (result[1] < 1) {
				result[1] = 1; // ¯\_(ツ)_/¯
			}

			if (recipe.EUt <= 16 && result[1] <= 2) {
				waste = true;
			}

			output.push({
				EUt: result[0],
				duration: result[1],
				waste,
				tier,
				isMacerator: recipe.isMacerator,
				chance: recipe.chance ? Math.min(100, recipe.chance * getByproductChanceMultiplier(tier, recipe)) : undefined,
			});
		}
	}

	return output;
};
