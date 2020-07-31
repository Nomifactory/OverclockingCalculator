import 'normalize.css';
import './style.scss';

import { h, render, Component, createRef, RefObject } from "preact";
import { NumberInputLine } from "./components/NumberInputLine";
import isEqual from "lodash-es/isequal";
import { Recipe } from './types/Recipe';
import { OutputBlock } from "./components/OutputBlock"
import { RecipeResult } from "./types/RecipeResult"
import * as util from "./util"

class Calculator extends Component {
	constructor() {
		super();

		window.onhashchange = () => {
			const params = new URLSearchParams(location.hash.replace(/^#/, ""));

			this.inputs.EUt.current.input.current.value      = (Number(params.get("eut")) || 0).toString();
			this.inputs.Duration.current.input.current.value = (Number(params.get("duration")) || 0).toString();
			this.inputs.Chance.current.input.current.value   = (Number(params.get("chance")) || 0).toString();
			this.inputs.CheckboxMacerator.current.checked    = Boolean(params.get("mace"));
			this.inputs.RadioSeconds.current.checked         = Boolean(params.get("seconds"));
			this.inputs.RadioTicks.current.checked           = !Boolean(params.get("seconds"));
	
			this.changeCallback(true);
		}
	}
	componentDidMount() {
		window.onhashchange(null);

		this.darkModes[this.darkMode]();
	}

	private timerHandle: NodeJS.Timeout;

	private inputs = {
		"EUt": createRef<NumberInputLine>(),
		"Duration": createRef<NumberInputLine>(),
		"Chance": createRef<NumberInputLine>(),
		"RadioSeconds": createRef<HTMLInputElement>(),
		"RadioTicks": createRef<HTMLInputElement>(),
		"CheckboxMacerator": createRef<HTMLInputElement>(),
	}

	private outputBlock = createRef<OutputBlock>();
	private darkModeButton = createRef<HTMLInputElement>();

	private previousRecipe: Recipe;

	private destroyTimer() {
		if (this.timerHandle) {
			clearTimeout(this.timerHandle);
			this.timerHandle = null;
		}
	}

	private calculate(recipe: Recipe) {
		this.destroyTimer();

		if (isEqual(recipe, this.previousRecipe)) {
			return;
		} else {
			this.previousRecipe = recipe;
		}

		if (recipe.chance === 0) {
			recipe.chance = 0;
		}

		this.handleWindowHash(recipe);

		this.outputBlock.current.setState({
			results: util.calculateOverclock(recipe),
			chance: !!recipe.chance,
			seconds: recipe.seconds
		});
	}

	private handleWindowHash(recipe: Recipe) {
		let hash = `#`;
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
			* what the fuck
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

	private changeCallback(instant: boolean = false) {
		this.destroyTimer();

		const recipe: Recipe = {
			EUt: Number(this.inputs.EUt.current.input.current.value),
			duration: Number(this.inputs.Duration.current.input.current.value),
			chance: Number(this.inputs.Chance.current.input.current.value),
			isMacerator: Boolean(this.inputs.CheckboxMacerator.current.checked),
			seconds: Boolean(this.inputs.RadioSeconds.current.checked)
		}

		if (isEqual(recipe, this.previousRecipe)) {
			return;
		}

		this.timerHandle = setTimeout(() => {
			this.calculate(recipe);
		}, instant ? 0 : 500);
	}

	render() {
		const callback = () => { this.changeCallback() };
		const callbackInstant = () => { this.changeCallback(true) };

		return <div class="calculator">
			<div class="block darkmode">
				<input type="button" value="Dark Mode" ref={this.darkModeButton} onClick={() => { this.handleDarkMode() }}/>
			</div>
			<div class="block input">
				<div class="array">
					<NumberInputLine label="EU/t:" ref={this.inputs.EUt} changeCallback={callback}/>
					<div>
						<NumberInputLine label="Duration:" ref={this.inputs.Duration} changeCallback={callback}/>
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
					<NumberInputLine label="Recipe Chance (optional):" ref={this.inputs.Chance} changeCallback={callback}/>
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
				</div>
			</div>
			<OutputBlock ref={this.outputBlock}></OutputBlock>
			<div class="block attribution">
				<a href="https://github.com/NotMyWing/OverclockingCalculator">
					<span>Omnifactory OC Calculator, by </span>
					<img src="https://github.com/NotMyWing.png"></img>
				</a>
			</div>
		</div>
	}

	private darkModes = [
		() => {
			document.querySelector("body").className = "white";
			this.darkModeButton.current.value = "Light Mode";
		}, () => {
			document.querySelector("body").className = "dark";
			this.darkModeButton.current.value = "Semi-Dark Mode";
		}, () => {
			document.querySelector("body").className = "black";
			this.darkModeButton.current.value = "Dark Mode";
		}
	];
	private darkMode = Number(localStorage.getItem("darkMode")) || 0;
	handleDarkMode() {
		this.darkMode = (this.darkMode + 1) % this.darkModes.length;
		this.darkModes[this.darkMode]();
	
		localStorage.setItem("darkMode", this.darkMode.toString());
	}
}

render(<Calculator/>, document.body);

document.body.classList.add("white");
