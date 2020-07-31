import { h, Component, createRef, RefObject} from 'preact';
import { OutputBlockState } from "./OutputBlock";
import { VNames } from '../util';
import { RecipeResult } from '../types/RecipeResult';

export class CommentBlock extends Component<{}, OutputBlockState> {
	render() {
		if (this.state.results) {
			const comments: preact.JSX.Element[] = [];
			if (this.state.results.length > 0) {
				/*
				 * Find Cap
				 */
				let cap: RecipeResult;
				let continuousCap: RecipeResult;
				let maxChance: RecipeResult;

				this.state.results.forEach((recipe, index) => {
					if (!continuousCap && recipe.duration === 2) {
						continuousCap = recipe;
					}

					if (this.state.chance && (!maxChance || maxChance.chance < recipe.chance)) {
						maxChance = recipe;
					}

					if (!cap && recipe.duration === 1) {
						cap = recipe;
					}
				});

				const last =  this.state.results[this.state.results.length - 1];
				const maxSpeed = cap || continuousCap || last;

				if (this.state.results[0].EUt <= 16) {
					comments.push(<li>
						Since the recipe has the base EU/t of <b>16</b> or less,
						the duration is divided by <b>2</b> per overclock.
						{maxSpeed !== last && <ul><li>
							Because GTCE has a flaw in the logic, the recipe starts wasting power
							after <b>{VNames[(continuousCap || cap).tier]}</b>.
						</li></ul>}
					</li>)
				} else {
					comments.push(<li>
						Since the recipe has the base EU/t higher than <b>16</b>,
						the duration is divided by <b>2.8</b> per overclock.
					</li>)
				}

				if (continuousCap && cap) {
					comments.push(<li>
						While the recipe technically caps out at <b>{VNames[cap.tier]}</b>,
						the recipe will be processed at the same speed 
						in <b>{VNames[continuousCap.tier]} machine</b> for less power when running continuously.
					</li>)
				} else {
					comments.push(<li>
						The recipe reaches the maximum speed at <b>{VNames[maxSpeed.tier]}</b>.
						{maxSpeed == continuousCap && <ul><li>
							While the recipe caps out at 2 ticks, it will actually be
							processed faster (at 1 tick) when running continuously.
						</li></ul>}
					</li>)
				}
				
				if (this.state.chance) {
					if (this.state.results[0].isMacerator) {
						comments.push(<li>
							Because the machine is macerator, the product chance
							starts scaling after <b>MV</b>.
						</li>)
					}
				}
			}

			return <div class="block comment">
				{comments.length > 0 &&
					<ul>
						{comments.map(c => <li>{c}</li>)}
					</ul>
				}
			</div>;
		}
	}
}
