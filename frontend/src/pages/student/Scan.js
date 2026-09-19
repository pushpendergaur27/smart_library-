import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Alert, Button, Form } from 'react-bootstrap';
import { Html5Qrcode } from 'html5-qrcode';
import { borrowService } from '../../services/borrowService';
import AlertMessage from '../../components/AlertMessage';
import { FiCamera, FiCheckCircle, FiXCircle, FiEdit3 } from 'react-icons/fi';

const ScanBarcode = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [mode, setMode] = useState('');
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop();
          html5QrCodeRef.current.clear();
        } catch (e) {
        }
      }
    };
  }, []);

  const startScanning = async () => {
    setError('');
    setResult(null);
    setMode('scan');
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
        () => {}
      );
    } catch (err) {
      setError('Failed to start camera. Please ensure camera access is allowed.');
      setScanning(false);
      setMode('');
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
      }
    }
    setScanning(false);
    setMode('');
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

  const handleManualBorrow = async (e) => {
    e.preventDefault();
    if (!manualBarcode.trim()) {
      setError('Please enter a barcode.');
      return;
    }
    await processBarcode(manualBarcode.trim());
    setManualBarcode('');
  };

  const resetScanner = () => {
    setResult(null);
    setError('');
    setMode('');
  };

  return (
    <Container fluid>
      <h3 className="mb-4 fw-bold">Borrow a Book</h3>

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-5">
              {!scanning && !result && !processing && !mode && (
                <div className="text-center">
                  <div className="mb-4">
                    <FiCamera size={64} className="text-primary" />
                  </div>
                  <h5>How would you like to borrow?</h5>
                  <p className="text-muted mb-4">
                    Scan the barcode with your camera, or type it manually.
                  </p>
                  <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
                    <Button variant="primary" size="lg" onClick={startScanning} className="px-4">
                      <FiCamera className="me-2" /> Scan Barcode
                    </Button>
                    <Button variant="outline-primary" size="lg" onClick={() => setMode('manual')} className="px-4">
                      <FiEdit3 className="me-2" /> Enter Manually
                    </Button>
                  </div>
                </div>
              )}

              {scanning && (
                <div className="text-center">
                  <div
                    id="scanner-reader"
                    ref={scannerRef}
                    style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
                  />
                  <Button variant="outline-danger" className="mt-3" onClick={stopScanning}>
                    Cancel
                  </Button>
                </div>
              )}

              {mode === 'manual' && !result && !processing && (
                <div>
                  <h5 className="mb-3">Enter Book Barcode</h5>
                  <Form onSubmit={handleManualBorrow}>
                    <Form.Group className="mb-3">
                      <Form.Label>Library Barcode</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. 9780134685991-C1"
                        value={manualBarcode}
                        onChange={(e) => setManualBarcode(e.target.value)}
                        autoFocus
                      />
                      <Form.Text className="text-muted">
                        Enter the barcode printed on the book's library sticker.
                      </Form.Text>
                    </Form.Group>
                    <div className="d-flex gap-2">
                      <Button variant="primary" type="submit" disabled={!manualBarcode.trim()}>
                        Borrow Book
                      </Button>
                      <Button variant="outline-secondary" onClick={resetScanner}>
                        Back
                      </Button>
                    </div>
                  </Form>
                </div>
              )}

              {processing && (
                <div className="text-center py-4">
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
                <div className="text-center py-3">
                  {result.success ? (
                    <FiCheckCircle size={64} className="text-success mb-3" />
                  ) : (
                    <FiXCircle size={64} className="text-danger mb-3" />
                  )}
                  <Alert variant={result.success ? 'success' : 'danger'}>
                    {result.message}
                  </Alert>
                  <Button variant="primary" onClick={resetScanner}>
                    Borrow Another Book
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
