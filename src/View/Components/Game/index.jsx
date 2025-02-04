import React, {Component} from 'react';
import { connect } from 'react-redux';
import Trie from '../../../Controller/Trie.js';
import BoggleActions from '../../../ViewModel/actions/boggle_actions';
import './Game.scss';
class Game extends Component {
	constructor(props){
		super(props);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.allowDirection = this.allowDirection.bind(this);
		this.isBackward = this.isBackward.bind(this);
		this.start = this.start.bind(this);
		this.end = this.end.bind(this);

		this.touch_start = this.touch_start.bind(this);
		this.touch_move = this.touch_move.bind(this);
		this.touch_end = this.touch_end.bind(this);

		this.selectedIds = [];
		this.selectedPath = [];
	}

	allowDirection(pos) {
		let direction = null;
		let lastPos = this.selectedPath[this.selectedPath.length-1];
		if ( lastPos.col === pos.col && lastPos.row+1 === pos.row  ) { direction = "right"
		} else if ( lastPos.col === pos.col && lastPos.row-1 === pos.row ) { direction = "left"
		} else if ( lastPos.row === pos.row && lastPos.col+1 === pos.col ) { direction = "down"
		} else if ( lastPos.row === pos.row && lastPos.col-1 === pos.col ) { direction = "up"}
		else if (lastPos.row === pos.row && lastPos.col === pos.col){ direction = true}
		return direction;
	}

	isBackward(goingPos) {
		let lastPos = this.selectedPath[this.selectedPath.length-2];
		let beforePos = this.selectedPath[this.selectedPath.length-1];
		if ( lastPos ) {
			if (goingPos.row === lastPos.row && goingPos.col === lastPos.col) return "-"; 
		}
		if ( beforePos ) {
			if (goingPos.row === beforePos.row && goingPos.col === beforePos.col) return "=";
		}
		return "+";
	}

	start(item,pos) {
		this.draging = true;
		if ( this.props.winingStatus < 0) return;
		let string = this.props.string;
			string += item.value;
			this.selectedIds.push(item.id);
			this.selectedPath.push(pos);
		this.props.start_touch(string);
	}

	handleMouseEnter(item,goingPos) {
		if (!this.draging) return;
		if (this.props.winingStatus < 0) return;
		if (this.allowDirection(goingPos)) {
			
			let string = this.props.string;
			let calc = this.isBackward(goingPos);

			if ( calc === "-") {
				this.selectedIds.pop();
				this.selectedPath.pop();
				string = string.slice(0, string.length-1);
			} else if (calc === "+"){
				string += item.value;
				this.selectedIds.push(item.id);
				this.selectedPath.push(goingPos);
			}

			this.props.swipe({string});
		}
	}

	end() {
		// back to defaults
		this.draging = false;
		let obj = {
			string: this.props.string,
			cells: this.selectedIds
		}
		let answerIds = [...this.props.answerIds];
		let userAnswers = [...this.props.userAnswers];
		
		if ( Trie.contains(this.props.string) ) {
			answerIds = answerIds.concat(this.selectedIds);
			let index = -1;
			for (let i=0; i < userAnswers.length ; i++) {
				if ( userAnswers[i].string === obj.string ) {
					index = i;
					break;
				}
			}
			if ( index === -1 ) { userAnswers.push(obj); }
		}
		
		this.selectedIds = [];
		this.selectedPath = [];
		this.props.end_touch(answerIds,userAnswers);
	}

	touch_start(event) {

		if ( this.props.winingStatus < 0) return;
		let element = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
		let classList = element.classList.value.split(" ");
		if (classList.indexOf('cell') === -1 ) return;

		let pos = {
			row: parseInt(element.dataset.row),
			col: parseInt( element.dataset.col)
		}

		this.draging = true;
		let string = this.props.string;
			string += element.innerText;
			this.selectedIds.push(element.dataset.id);
			this.selectedPath.push(pos);
		this.props.start_touch(string);
	}

	touch_move(event) {

		if (this.props.winingStatus < 0) return;
		let element = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
		let classList = element.classList.value.split(" ");
		if (classList.indexOf('cell') === -1 ) return;

		let goingPos = {
			row: parseInt(element.dataset.row),
			col: parseInt( element.dataset.col)
		}

		if (this.allowDirection(goingPos)) {

			let string = this.props.string;
			let calc = this.isBackward(goingPos);
			if ( calc === "-") {
				this.selectedIds.pop();
				this.selectedPath.pop();
				string = string.slice(0, string.length-1);
			} else if (calc === "+"){
				string += element.innerText;
				this.selectedIds.push(element.dataset.id);
				this.selectedPath.push(goingPos);
			}
			this.props.swipe({string});
		}
	}

	touch_end() {
		// back to defaults
		this.draging = false;
		let obj = {
			string: this.props.string,
			cells: this.selectedIds
		}
		let answerIds = [...this.props.answerIds];
		let userAnswers = [...this.props.userAnswers];
		
		if ( Trie.contains(this.props.string) ) {
			answerIds = answerIds.concat(this.selectedIds);
			let index = -1;
			for (let i=0; i < userAnswers.length ; i++) {
				if ( userAnswers[i].string === obj.string ) {
					index = i;
					break;
				}
			}
			if ( index === -1 ) { userAnswers.push(obj); }
		}
		
		this.selectedIds = [];
		this.selectedPath = [];
		this.props.end_touch(answerIds,userAnswers);
	}

	render() {
		let row=-1,col=0;
		const {Lang , language } = this.props;
		return (
		<React.Fragment>
			
			<div className="Game-Wrapper">
				<div className="Menu">
					<nav>
						<button className="new" onClick={()=> {this.props.set_view(false)}}>{Lang[language].back}</button>
						<ul className="actions">
							<li><button className="new" onClick={this.props.playGame}><i className="fa fa-gamepad" aria-hidden="true"></i><span>{Lang[language].new_game}</span></button></li>
							<li><button className="help" onClick={() => {this.props.toggle_modal(null)}}><i className="fa fa-exclamation" aria-hidden="true"></i><span>{Lang[language].help}</span></button></li>
						</ul>
					</nav>
				</div>
				<div className="Game-Header">
					<label className="total-words">
						<span>{Lang[language].possibilities}</span>
						<span className="num">{this.props.Answers ? this.props.Answers.length : null}</span>
					</label>
					<p className={(this.props.winingStatus > 0? " win " : " loose ") + "currentString"}>
						{(this.props.winingStatus !== 0) ? (this.props.winingStatus > 0) ? Lang[language].win :  Lang[language].loose : this.props.string}
					</p>
					<label className="clock">
						<span className="num">{this.props.clock}</span>
						<span className="clock fa fa-clock-o"></span>
					</label>
				</div>
				<div className="Game" onTouchMove={this.touch_move} onTouchEnd={this.touch_end} onTouchStart={this.touch_start}>
					{ this.props.tableValues ? this.props.tableValues.map((item) => {
						// makeing index for table
						if( row >= 4 ){col++;row = 0;}else{ row++ };
						let pos = {row,col};
						return (
							<div data-row={row} data-col={col} data-id={item.id} className={
								(this.props.winingStatus !== 0 ? this.props.winingStatus > 0 ? " win " : "loose" : "") +
								(this.selectedIds.indexOf(item.id) !== -1 ? " active " : "") + " cell"}
								key={item.id}
								unselectable="on"
								onMouseUp={this.end}
								onMouseDown={()=> {this.start(item,pos)}}
								onMouseEnter={()=> {this.handleMouseEnter(item,pos)}}>{item.value}
							</div>)
							}) : null}
				</div>
				<div className="answer-list">
					<p>{Lang[language].user_pickups}</p>
					{this.props.userAnswers ? this.props.userAnswers.map((item,index) => {
						return <span className="user-words" key={index}><i className="fa fa-tag" aria-hidden="true"></i><span>{item.string}</span></span>
					}): null}
				</div>
			</div>
		</React.Fragment>);
	}
}

const mappropsToProps = (state) => {
	return {
		clock: state.Boggle.clock,
		string: state.Boggle.string,
		Answers: state.Boggle.Answers,
		language: state.Boggle.language,
		answerIds: state.Boggle.answerIds,
		tableValues: state.Boggle.tableValues,
		selectedIds: state.Boggle.selectedIds,
		userAnswers: state.Boggle.userAnswers,
		winingStatus: state.Boggle.winingStatus,
		selectedPath: state.Boggle.selectedPath,
		help_visibility: state.Boggle.help_visibility,
	}
}

export default connect( mappropsToProps , BoggleActions )(Game);
