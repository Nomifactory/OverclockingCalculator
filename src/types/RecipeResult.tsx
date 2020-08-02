import { Recipe } from "./Recipe";

export type RecipeResult = Recipe & {
	waste: boolean;
	tier: number;
};
