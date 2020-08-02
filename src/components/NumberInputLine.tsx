import { h, Component, createRef, RefObject} from "preact";

type NumberInputLineProps = {
	label: string;
	changeCallback?: (e: Event) => void;
};

export class NumberInputLine extends Component<NumberInputLineProps, NumberInputLineProps> {
	input: RefObject<HTMLInputElement>;
	label: string;

	private onChange(e: Event) {
		if (this.state.changeCallback) {
			return this.props.changeCallback(e);
		}

		if (this.props.changeCallback) {
			return this.props.changeCallback(e);
		}
	}

	constructor(props: NumberInputLineProps) {
		super(props);
		this.input = createRef<HTMLInputElement>();
	}

	render(): h.JSX.Element {
		const callback = (e) => { this.onChange(e); };

		return <div class="input-line">
			<span>{this.state.label || this.props.label}</span>
			<input type="number" placeholder="0" ref={this.input} onChange={callback} onInput={callback} />
		</div>;
	}
}
