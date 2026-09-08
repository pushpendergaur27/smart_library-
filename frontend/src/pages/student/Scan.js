import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { Html5Qrcode } from 'html5-qrcode';
import { borrowService } from '../../services/borrowService';
import AlertMessage from '../../components/AlertMessage';
import { FiCamera, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const ScanBarcode = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop();
          html5QrCodeRef.current.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const startScanning = async () => {
    setError('');
    setResult(null);
    setScanning(true);

    try {
      const html5QrCode = new Html5Qrcode('scanner-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        () => {} // ignore errors during scanning
      );
    } catch (err) {
      setError('Failed to start camera. Please ensure camera access is allowed.');
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        // Ignore
      }
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    await stopScanning();
    await processBarcode(decodedText);
  };

  const processBarcode = async (barcode) => {
    setProcessing(true);
    setError('');
    try {
      const response = await borrowService.borrowBook(barcode);
      setResult({
        success: true,
        message: response.message || 'Book borrowed successfully!',
        data: response,
      });
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || 'Failed to process borrowing.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setError('');
  };

  return (
    <Container fluid>
      <h3 className="mb-4 fw-bold">Scan Book Barcode</h3>

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center p-5">
              {!scanning && !result && (
                <>
                  <div className="mb-4">
                    <FiCamera size={64} className="text-primary" />
                  </div>
                  <h5>Ready to Scan</h5>
                  <p className="text-muted">
                    Point your camera at the library barcode on the book to borrow it.
                  </p>
                  <Button variant="primary" size="lg" onClick={startScanning}>
                    Start Scanner
                  </Button>
                </>
              )}

              {scanning && (
                <>
                  <div
                    id="scanner-reader"
                    ref={scannerRef}
                    style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
                  />
                  <Button variant="outline-danger" className="mt-3" onClick={stopScanning}>
                    Stop Scanner
                  </Button>
                </>
              )}

              {processing && (
                <div className="py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Processing...</span>
                  </div>
                  <p className="mt-3">Processing borrowing request...</p>
                </div>
              )}

              {error && !result && (
                <AlertMessage variant="danger" message={error} />
              )}

              {result && (
                <div className="py-3">
                  {result.success ? (
                    <FiCheckCircle size={64} className="text-success mb-3" />
                  ) : (
                    <FiXCircle size={64} className="text-danger mb-3" />
                  )}
                  <Alert variant={result.success ? 'success' : 'danger'}>
                    {result.message}
                  </Alert>
                  <Button variant="primary" onClick={resetScanner}>
                    Scan Another Book
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ScanBarcode;
