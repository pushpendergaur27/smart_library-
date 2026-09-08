import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Html5Qrcode } from 'html5-qrcode';
import { borrowService } from '../../services/borrowService';
import AlertMessage from '../../components/AlertMessage';
import { FiCamera, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const ReturnsPage = () => {
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop();
          html5QrCodeRef.current.clear();
        } catch (e) {}
      }
    };
  }, []);

  const startScanning = async () => {
    setError('');
    setResult(null);
    setScanning(true);
    try {
      const html5QrCode = new Html5Qrcode('return-scanner');
      html5QrCodeRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await stopScanning();
          setBarcode(decodedText);
          await processReturn(decodedText);
        },
        () => {}
      );
    } catch (err) {
      setError('Failed to start camera.');
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {}
    }
    setScanning(false);
  };

  const processReturn = async (code) => {
    setProcessing(true);
    setError('');
    try {
      const response = await borrowService.returnBook(code);
      setResult({ success: true, message: response.message || 'Book returned successfully!', data: response });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Failed to process return.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    await processReturn(barcode);
  };

  return (
    <Container fluid>
      <h3 className="mb-4 fw-bold">Process Returns</h3>

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="mb-3">Return by Barcode</h5>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Enter or scan barcode</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter barcode..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    disabled={processing}
                  />
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button variant="primary" type="submit" disabled={processing || !barcode.trim()}>
                    {processing ? 'Processing...' : 'Process Return'}
                  </Button>
                  <Button variant="outline-primary" onClick={scanning ? stopScanning : startScanning}>
                    <FiCamera className="me-1" />
                    {scanning ? 'Stop Scanner' : 'Scan Barcode'}
                  </Button>
                </div>
              </Form>

              {scanning && (
                <div className="mt-3">
                  <div id="return-scanner" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }} />
                </div>
              )}

              {processing && (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="mt-2">Processing return...</p>
                </div>
              )}

              {result && (
                <div className="mt-3">
                  {result.success ? (
                    <FiCheckCircle size={48} className="text-success mb-2" />
                  ) : (
                    <FiXCircle size={48} className="text-danger mb-2" />
                  )}
                  <Alert variant={result.success ? 'success' : 'danger'}>{result.message}</Alert>
                  <Button variant="outline-primary" size="sm" onClick={() => { setResult(null); setBarcode(''); }}>
                    Process Another Return
                  </Button>
                </div>
              )}

              {error && !result && <AlertMessage variant="danger" message={error} />}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReturnsPage;
