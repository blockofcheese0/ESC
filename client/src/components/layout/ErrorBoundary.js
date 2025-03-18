import React, { Component } from 'react';
import { Alert, Container } from 'react-bootstrap';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="mt-5">
          <Alert variant="danger">
            <Alert.Heading>Something went wrong</Alert.Heading>
            <p>
              We're sorry, but an error has occurred. Please try refreshing the page or contact support
              if the problem persists.
            </p>
            <hr />
            <p className="mb-0">
              Error details: {this.state.error?.message}
            </p>
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;