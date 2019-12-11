import React, { Component } from "react";
import ReactDiffViewer from 'react-diff-viewer'
import "./DebugDisplay.css";

interface IProps {
    vscode: any;
    txTrace: any;
    deployedResult: object;
}
interface IState {
    txHash: string | null;
    debugObj: object;
    olddebugObj: object;
    newdebugObj: object;
    indx: any;
    deployedResult: object
}

class DebugDisplay extends Component<IProps, IState> {
    public state = {
        txHash: '',
        debugObj: {},
        olddebugObj: {},
        newdebugObj: {},
        indx: -1,
        deployedResult: {}
    };
    constructor(props: IProps) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.stopDebug = this.stopDebug.bind(this);
        this.debugInto = this.debugInto.bind(this);
        this.debugBack = this.debugBack.bind(this);
    }

    handleSubmit(event: any) {
        const { txHash } = this.state;
        event.preventDefault();
        // get tx from txHash & debug transaction
        this.props.vscode.postMessage({
            command: "debugTransaction",
            txHash
        });
    }
    componentDidUpdate(prevProps: IProps) {
        const { newdebugObj } = this.state
        if(this.props.txTrace !== prevProps.txTrace) {
            this.setState({
                indx: 0,
                // debugObj: this.props.txTrace[0],
                olddebugObj: newdebugObj,
                newdebugObj: this.props.txTrace[0],
            })
        }
    }
    handleChange(event: any) {
        this.setState({ txHash: event.target.value });
    }
    stopDebug() {
        this.setState({ indx: -1, debugObj: {} });
    }
    debugInto() {
        const { newdebugObj } = this.state
        const { txTrace } = this.props;
        const index = (this.state.indx < txTrace.length-1) ?
        this.state.indx+1 : 
        txTrace.length-1;
        if(txTrace.length > 0) {
            this.setState({ 
                indx: index, 
                // debugObj: txTrace[index],
                newdebugObj: txTrace[index],
                olddebugObj: newdebugObj
            });
        }
    }
    debugBack() {
        const { newdebugObj } = this.state
        const { txTrace } = this.props;
        const index = this.state.indx > 0 ? this.state.indx-1 : 0;
        if(txTrace.length > 0) {
            this.setState({ 
                indx: index, 
                // debugObj: txTrace[index],
                newdebugObj: txTrace[index],
                olddebugObj: txTrace[index-1]
            });
        }

    }
    public render() {
        const { indx, debugObj, olddebugObj, newdebugObj } = this.state;
        const { txTrace } = this.props;

        return (
            <div className="container">
                <div>
                    <form onSubmit={this.handleSubmit}>
                        <label>
                            <span style={{ marginRight: '5px' }}>Transaction hash:</span>
                            <input type="text" value={this.state.txHash} onChange={this.handleChange} />
                        </label>
                        <input type="submit" value="Debug" />
                    </form>
                </div>
                {
                    indx >= 0 &&
                    <div>
                        <p>
                            <button className="input text-subtle" onClick={this.stopDebug}>Stop</button>
                        </p>
                        <div>
                            <p>OPCodes:</p>
                            <div>
                                <ul className="opDiv">
                                    { txTrace.map((obj: any, index: any) => {
                                        return <li className={index === indx ? "selected" : ""} key={index} id={index}>{obj.op}</li>;
                                    }) }
                                </ul>
                            </div>
                            <div>
                                <p>
                                    <button onClick={this.debugBack}>Step Back</button>
                                    <button onClick={this.debugInto}>Step Into</button>
                                </p>
                            </div>
                        </div>
                        {/* TODO */}
                        <ReactDiffViewer
                            oldValue={JSON.stringify(olddebugObj, null, "\t")}
                            newValue={JSON.stringify(newdebugObj, null, "\t")}
                            splitView={true}
                        />
                    </div>
                }
            </div>
        );
    }
}
export default DebugDisplay;