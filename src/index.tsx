import "normalize.css";
import "./style.scss";

import { h, render, Component, createRef } from "preact";
import { NumberInputLine } from "./components/NumberInputLine";
import { Recipe } from "./types/Recipe";
import { OutputBlock, OutputBlockState } from "./components/OutputBlock";
import { CommentBlock } from "./components/CommentBlock";
import * as util from "./util";
import projectPackage from "../package.json";

import isEqual = require("lodash.isequal");

class Calculator extends Component {
	private inputs = {
		EUt: createRef<NumberInputLine>(),
		Duration: createRef<NumberInputLine>(),
		Chance: createRef<NumberInputLine>(),
		RadioSeconds: createRef<HTMLInputElement>(),
		RadioTicks: createRef<HTMLInputElement>(),
		CheckboxMacerator: createRef<HTMLInputElement>(),
	};

	private outputBlock = createRef<OutputBlock>();
	private commentBlock = createRef<CommentBlock>();
	private darkModeButton = createRef<HTMLInputElement>();

	private previousRecipe: Recipe;

	private timerHandle: NodeJS.Timeout;

	private darkModes = [
		() => {
			document.querySelector("body").className = "white";
			this.darkModeButton.current.value = "Light Mode";
		},
		() => {
			document.querySelector("body").className = "dark";
			this.darkModeButton.current.value = "Semi-Dark Mode";
		},
		() => {
			document.querySelector("body").className = "black";
			this.darkModeButton.current.value = "Dark Mode";
		},
	];

	private darkMode = Number(localStorage.getItem("darkMode")) || 0;
	private darkModeClicks = 0;

	constructor() {
		super();

		window.onhashchange = () => {
			const params = new URLSearchParams(location.hash.replace(/^#/, ""));

			const eut = Number(params.get("eut"));
			if (eut !== 0) {
				this.inputs.EUt.current.input.current.value = eut.toString();
			}

			const duration = Number(params.get("duration"));
			if (duration !== 0) {
				this.inputs.Duration.current.input.current.value = duration.toString();
			}

			const chance = Number(params.get("chance"));
			if (chance) {
				this.inputs.Chance.current.input.current.value = chance.toString();
			}

			this.inputs.CheckboxMacerator.current.checked = Boolean(params.get("mace"));
			this.inputs.RadioSeconds.current.checked = Boolean(params.get("seconds"));
			this.inputs.RadioTicks.current.checked = !params.get("seconds");

			this.calculate(true);
		};
	}

	/**
	 * Update the location hash based on the given recipe.
	 *
	 * @param recipe Recipe
	 */
	private updateLocationHash(recipe: Recipe) {
		let hash = "#";
		if (recipe.EUt !== 0) {
			hash += `eut=${recipe.EUt}`;
		}
		if (recipe.duration !== 0) {
			hash += `&duration=${recipe.duration}`;
		}
		if (recipe.seconds) {
			hash += `&seconds=${recipe.seconds}`;
		}
		if (recipe.chance) {
			hash += `&chance=${recipe.chance}`;
			if (recipe.isMacerator) {
				hash += `&mace=${recipe.isMacerator}`;
			}
		}
		if (window.location.hash !== hash) {
			/*
			 * what the fuck is this code man
			 */
			const callback = window.onhashchange;
			window.onhashchange = null;

			if (hash === "#") {
				history.pushState(null, null, " ");
			} else {
				window.location.hash = hash;
			}

			setTimeout(() => {
				window.onhashchange = callback;
			}, 0);
		}
	}

	/**
	 * Gathers recipe input values from all inputs on the page.
	 */
	private getRecipeInputValues(): Recipe {
		return {
			EUt: Number(this.inputs.EUt.current.input.current.value),
			duration: Number(this.inputs.Duration.current.input.current.value),
			chance: Number(this.inputs.Chance.current.input.current.value),
			isMacerator: Boolean(this.inputs.CheckboxMacerator.current.checked),
			seconds: Boolean(this.inputs.RadioSeconds.current.checked),
		};
	}

	/**
	 * Commences a calculation.
	 *
	 * @param instant Shall the calculation be instant?
	 */
	private calculate(instant = false) {
		if (this.timerHandle) {
			clearTimeout(this.timerHandle);
			this.timerHandle = null;
		}

		const recipe = this.getRecipeInputValues();

		if (recipe.EUt === 0 || isEqual(recipe, this.previousRecipe)) {
			return;
		}

		this.timerHandle = setTimeout(
			() => {
				const state: OutputBlockState = {
					results: util.calculateOverclock(recipe),
					seconds: recipe.seconds,
					chanced: !!recipe.chance,
					bunned: false,
				};

				this.outputBlock.current.setState(state);
				this.commentBlock.current.setState(state);

				this.previousRecipe = recipe;
				this.updateLocationHash(recipe);
			},
			instant ? 0 : 500,
		);
	}

	/**
	 * Renders the calculator.
	 */
	render() {
		const callback = () => {
			this.calculate();
		};
		const callbackInstant = () => {
			this.calculate(true);
		};

		return (
			<div class="calculator">
				{/* Title Block */}
				<div class="block title">
					Omnifactory{"\u00A0"}v1.2.2 Overclocking{"\u00A0"}Calculator <sup>{projectPackage.version}</sup>
				</div>

				{/* Input Block */}
				<div class="input-container">
					<div class="block input">
						<div class="array">
							<NumberInputLine label="EU/t:" ref={this.inputs.EUt} changeCallback={callback} />
							<div>
								<NumberInputLine label="Duration:" ref={this.inputs.Duration} changeCallback={callback} />
								<div class="radio-group">
									<div class="input-box">
										<input
											type="radio"
											name="tors"
											id="ticks"
											ref={this.inputs.RadioTicks}
											onClick={callbackInstant}
											onChange={callbackInstant}
											onInput={callbackInstant}
										/>
										<label for="ticks">Ticks</label>
									</div>

									<div class="input-box">
										<input
											type="radio"
											name="tors"
											id="seconds"
											ref={this.inputs.RadioSeconds}
											onClick={callbackInstant}
											onChange={callbackInstant}
											onInput={callbackInstant}
										/>
										<label for="seconds">Seconds</label>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="block chance">
						<div>
							<NumberInputLine
								label="Base Product Chance (optional):"
								ref={this.inputs.Chance}
								changeCallback={callback}
							/>
							<div class="radio-group">
								<div class="input-box">
									<input
										type="checkbox"
										name="macerator"
										ref={this.inputs.CheckboxMacerator}
										onClick={callbackInstant}
										onChange={callbackInstant}
										id="macerator"
									/>
									<label for="macerator">Machine is Macerator</label>
								</div>
							</div>
							<div class="hint">Hover over a product in JEI. If it has a chance associated with it, type it here.</div>
						</div>
					</div>
				</div>

				{/* Output Block */}
				<OutputBlock ref={this.outputBlock} />

				{/* Comment Block */}
				<CommentBlock ref={this.commentBlock} />

				{/* Attribution Block */}
				<div class="block attribution">
					<input
						type="button"
						value="Dark Mode"
						ref={this.darkModeButton}
						onClick={() => {
							this.handleDarkMode();
						}}
					/>
					<a href="https://github.com/OmnifactoryDevs/OverclockingCalculator" rel="noreferrer" target="_blank">
						<span>OmnifactoryDevs </span>
						<img src="https://github.com/OmnifactoryDevs.png?size=64" />
					</a>
				</div>
			</div>
		);
	}

	/**
	 * Post-render hook. Enable animations and dark mode.
	 */
	componentDidMount() {
		window.onhashchange(null);

		this.darkModes[this.darkMode]();

		setTimeout(() => {
			document.querySelector(".calculator").classList.add("animated");
		}, 250);
	}

	/**
	 * Handle the darkmode button, alternating between three different modes.
	 */
	private handleDarkMode() {
		this.darkMode = (this.darkMode + 1) % this.darkModes.length;
		this.darkModes[this.darkMode]();

		localStorage.setItem("darkMode", this.darkMode.toString());

		/**
		 * 🐰
		 */
		this.darkModeClicks++;
		if (this.darkModeClicks > 10) {
			const state = {
				bunned: true,
			};

			this.outputBlock.current.setState(state);
			this.commentBlock.current.setState(state);

			this.darkModeClicks = 0;
		}
	}
}

render(<Calculator />, document.body);
