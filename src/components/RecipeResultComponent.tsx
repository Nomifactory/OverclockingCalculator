import { h, Component, createRef, RefObject} from 'preact';
import { RecipeResult } from '../types/RecipeResult';

export class RecipeResultComponent extends Component<RecipeResult> {
	render() {
		return <p>{this.props.EUt}</p>
	}
}
