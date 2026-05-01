import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, margin: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#DC2626', marginBottom: 8 }}>Runtime Error (page crashed)</div>
          <div style={{ fontSize: 13, color: '#7F1D1D', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </div>
          <button onClick={() => this.setState({ error: null })} style={{ marginTop: 16, padding: '8px 16px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
