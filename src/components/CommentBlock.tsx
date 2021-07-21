import { h, Component } from "preact";
import { OutputBlockState } from "./OutputBlock";
import { VNames } from "../util";
import { RecipeResult } from "../types/RecipeResult";
import facts from "../assets/rabbitfacts.json";

export class CommentBlock extends Component<unknown, OutputBlockState> {
	render(): h.JSX.Element {
		const comments: preact.JSX.Element[] = [];
		if (this.state.bunned) {
			comments.push(...facts.map((fact) => <li>{fact}</li>));
			comments.push(
				<li>
					Source:{" "}
					<a
						target="_blank"
						rel="noreferrer"
						href="https://www.natgeokids.com/au/discover/animals/general-animals/10-hopping-fun-rabbit-facts/"
					>
						"10 HOPPING FUN RABBIT FACTS!"
					</a>
				</li>,
			);
		} else if (this.state.results && this.state.results.length > 0) {
			/*
			 * Find Various Stuff
			 */
			const last = this.state.results[this.state.results.length - 1];
			let cap: RecipeResult;
			let continuousCap: RecipeResult;
			let maxChance: RecipeResult;
			let maxSpeed: RecipeResult;

			this.state.results.forEach((recipe) => {
				if (!continuousCap && recipe.duration === 2) {
					continuousCap = recipe;
				}

				if (this.state.chanced && (!maxChance || maxChance.chance < recipe.chance)) {
					maxChance = recipe;
				}

				if (!cap && recipe.duration === 1) {
					cap = recipe;
				}

				if (!maxSpeed || maxSpeed.duration > recipe.duration) {
					maxSpeed = recipe;
				}
			});

			/**
			 * Push a comment about how the overclocking was calculated.
			 */
			if (this.state.results[0].EUt <= 16) {
				/**
				 * <= EU/t
				 */
				comments.push(
					<li>
						Since the recipe's base EU/t is <b>16</b> or less, the duration is divided by <b>2</b> per overclock.
						{maxSpeed !== last && (
							<ul>
								<li>
									Because GTCE has a flaw in its logic, the recipe starts wasting power after{" "}
									<b>{VNames[(continuousCap || cap).tier]}</b>.
								</li>
							</ul>
						)}
					</li>,
				);
			} else {
				/**
				 * > 16 EU/t
				 */
				comments.push(
					<li>
						Since the recipe's base EU/t is higher than <b>16</b>, the duration is divided by <b>2.8</b> per
						overclock.
					</li>,
				);
			}

			/**
			 * Push a comment about the speed cap.
			 */
			if (continuousCap && cap) {
				/**
				 * Continuous vs real cap.
				 */
				comments.push(
					<li>
						While the recipe technically caps out at <b>{VNames[cap.tier]}</b>, the recipe will be processed at the same
						speed in a <b>{VNames[continuousCap.tier]} machine</b> for less power when running continuously.
					</li>,
				);
			} else {
				/**
				 * Real cap.
				 */
				comments.push(
					<li>
						The recipe reaches maximum speed at <b>{VNames[maxSpeed.tier]}</b>.
						{maxSpeed == continuousCap && (
							<ul>
								<li>
									While the recipe caps out at 2 ticks, it will actually be processed faster (at 1 tick) when running
									continuously.
								</li>
							</ul>
						)}
					</li>,
				);
			}

			/**
			 * Push comments regarding chances.
			 */
			if (this.state.chanced) {
				comments.push(
					<li>
						The product chance maxes out at <b>{VNames[maxChance.tier]}</b>.
					</li>,
				);
				if (this.state.results[0].isMacerator) {
					comments.push(
						<li>
							Because the machine is a macerator, the product chance starts scaling after <b>MV</b>.
						</li>,
					);
				}
			}
		}

		/**
		 * Render comments.
		 */
		return (
			<div class="block comment">
				{comments.length > 0 && (
					<ul>
						{comments.map((c) => (
							<li>{c}</li>
						))}
					</ul>
				)}
			</div>
		);
	}
}
