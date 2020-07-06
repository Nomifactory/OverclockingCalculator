/**
 * https://github.com/NotMyWing
 */

const V = [
	8, 32, 128, 512, 2048, 8192, 32768, 131072, 524288
];

const VNames = [
	"ULV", "LV", "MV", "HV", "EV", "IV", "LuV", "ZPM", "UV"
];

const getTierByVoltage = (voltage) => {
	let tier = 0;
	while (++tier < V.length) {
		if (voltage == V[tier]) {
			return tier;
		} else if (voltage < V[tier]) {
			return Math.max(0, tier - 1);
		}
	}
	return Math.floor(Math.min(V.length -1, tier));
}

/*
https://github.com/GregTechCE/GregTech/blob/master/src/main/java/gregtech/api/capability/impl/AbstractRecipeLogic.java#L239
*/
const calculateOverclock = (EUt, voltage, duration) => {
	const negativeEU = EUt < 0;
	const tier = getTierByVoltage(voltage);
	if (V[tier] <= EUt || tier == 0)
		return [ EUt, duration ];
	if (negativeEU)
		EUt = -EUt;
	if (EUt <= 16) {
		const multiplier = EUt <= 8 ? tier : tier - 1;
		const resultEUt = EUt * (1 << multiplier) * (1 << multiplier);
		const resultDuration = duration / (1 << multiplier);
		return [ negativeEU ? -resultEUt : resultEUt, Math.floor(resultDuration) ];
	} else {
		let resultEUt = EUt;
		let resultDuration = duration;
		//do not overclock further if duration is already too small
		while (resultDuration >= 3 && resultEUt <= V[tier - 1]) {
			resultEUt *= 4;
			resultDuration /= 2.8;
		}
		return [ negativeEU ? -resultEUt : resultEUt, Math.ceil(resultDuration) ];
	}
}

/** @type {Element} */
let outputBlock;

/** @type {number} */
let timeoutHandle;

/** @type {number} */
let previousEUt;

/** @type {number} */
let previousDuration;

/**
 * Creates row data lmao
 */
const createRowData = (row, data) => {
	data.map(text => {
		const element = document.createElement("td");
		element.innerHTML = text;
		
		row.appendChild(element);
	})
}

const inputChangeCallback = () => {
	const EUt = Number(document.querySelector("#EUt").value);
	const duration = Number(document.querySelector("#duration").value);

	if (EUt && duration && (previousEUt !== EUt || previousDuration !== duration)) {
		previousDuration = EUt;
		previousEUt = previousEUt;

		/** @type {Node} */
		let child;

		while (child = outputBlock.firstChild) {
			outputBlock.removeChild(child);
		}

		let tier = 0;
		let voltage = 0;
		
		const table = document.createElement("table");

		const row = document.createElement("tr");
		createRowData(row, [
			`Tier`,
			`Duration`,
			`EU/t`
		]);

		table.appendChild(row);

		let waste = false;
		while (voltage < V[V.length - 1]) {
			voltage += V[tier];
			if (voltage == V[tier + 1]) {
				tier++;
			}
		
			const result = calculateOverclock(EUt, voltage, duration);
			if (voltage / V[tier] == 1 && voltage >= EUt) {
				let cap = "";
				let comment = "";
				
				if (waste) {
					comment = "(wastes&nbsp;energy)"
				}

				if (result[1] === 2) {
					cap = "(1&nbsp;if&nbsp;continuous)";
				} else if (result[1] < 2) {
					result[1] = 1; // ¯\_(ツ)_/¯
					cap = "(cap)";
				}

				if (EUt <= 16 && result[1] <= 2) {
					waste = true;
				}

				const row = document.createElement("tr");
				createRowData(row, [
					`${VNames[tier]}`,
					`${result[1]} t ${cap}`.trim(),
					`${result[0].toLocaleString("en-US")} EU/t ${comment}`.trim()
				]);

				table.appendChild(row);
			}
		}

		outputBlock.appendChild(table);

		/*
		 * what the fuck
		 */
		const callback = window.onhashchange;
		window.onhashchange = null;

		const params = new URLSearchParams(location.hash.replace(/^#/, ""));
		const locationEUt = Number(params.get("eut")) || 0;
		const locationDuration = Number(params.get("duration")) || 0;

		if (EUt !== locationEUt || duration !== locationDuration) {
			window.location.hash = `#eut=${EUt}&duration=${duration}`;
		}

		setTimeout(() => {
			window.onhashchange = callback;
		}, 0);
	}
}

const onInputChange = (instant) => {
	if (timeoutHandle) {
		clearTimeout(timeoutHandle);
	}

	if (instant) {
		inputChangeCallback();
	} else {
		timeoutHandle = setTimeout(inputChangeCallback, 500);
	}
}

/*
 * You're going to like this bit if you're Exa. 
 */
let darkModes = [
	() => {
		document.querySelector("body").className = "white";
		document.querySelector("#darkmode").value = "Light Mode";
	}, () => {
		document.querySelector("body").className = "dark";
		document.querySelector("#darkmode").value = "Semi-Dark Mode";
	}, () => {
		document.querySelector("body").className = "black";
		document.querySelector("#darkmode").value = "Dark Mode";
	}
];

let darkMode = Number(localStorage.getItem("darkMode")) || 0;
const switchDarkMode = () => {
	darkMode = (darkMode + 1) % darkModes.length;
	darkModes[darkMode]();

	localStorage.setItem("darkMode", darkMode);
}

window.onload = () => {
	console.log("hi");

	["#EUt", "#duration"]
		.map(id => document.querySelector(id))
		.forEach(element => {
			element.oninput  = () => onInputChange();
			element.onchange = () => onInputChange();
		});

	document.querySelector("#darkmode").onclick = switchDarkMode;
	darkModes[darkMode]();

	outputBlock = document.querySelector("#output");

	onInputChange();

	window.onhashchange = () => {
		const params = new URLSearchParams(location.hash.replace(/^#/, ""));
		document.querySelector("#EUt").value = Number(params.get("eut")) || 0;
		document.querySelector("#duration").value = Number(params.get("duration")) || 0;

		onInputChange(true);
	}
	window.onhashchange();
}
