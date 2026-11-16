import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="viewer-fallback">
            <p>3D preview unavailable on this device.</p>
            <p>Generate and Download STL still work above.</p>
          </div>
        )
      )
    }
    return this.props.children
  }
}
