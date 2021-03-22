import { h, Component } from "preact";
import { RecipeResult } from "../types/RecipeResult";
import { VNames } from "../util";

export type OutputBlockState = {
	results?: RecipeResult[];
	seconds?: boolean;
	chanced?: boolean;
	bunned?: boolean;
};

export class OutputBlock extends Component<unknown, OutputBlockState> {
	render(): h.JSX.Element {
		if (this.state.bunned) {
			return (
				<div class="block output">
					<div class="bunbun" />
				</div>
			);
		}

		return (
			<div class="block output">
				{this.state.results && (
					<table>
						<tr>
							<td class="tier">Tier</td>
							<td>Duration</td>
							{this.state.chanced && <td>Chance</td>}
							<td>EU/t</td>
							<td>Total EU</td>
						</tr>
						{this.state.results.map((recipeResult) => {
							return (
								<tr>
									<td class="tier">{VNames[recipeResult.tier]}</td>
									<td>{this.state.seconds ? `${recipeResult.duration / 20} s.` : `${recipeResult.duration} t.`}</td>
									{this.state.chanced && <td>{recipeResult.chance || 0}%</td>}
									<td>{recipeResult.EUt.toLocaleString("en-US")}</td>
									<td>{recipeResult.duration * recipeResult.EUt} EU</td>
								</tr>
							);
						})}
					</table>
				)}
			</div>
		);
	}
}
