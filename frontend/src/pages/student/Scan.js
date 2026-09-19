import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { Html5Qrcode } from 'html5-qrcode';
import AlertMessage from '../../components/AlertMessage';
import { FiCamera, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../services/api';

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
        } catch (e) {}
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
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        onScanSuccess,
        () => {}
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
      } catch (e) {}
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    await stopScanning();
    setProcessing(true);
    setError('');
    try {
      const response = await api.get(`/copies/${decodedText}`);
      setResult({ success: true, data: response.data, barcode: decodedText });
    } catch (err) {
      try {
        const errResponse = await api.get(`/books/search?q=${decodedText}`);
        if (errResponse.data && errResponse.data.length > 0) {
          setResult({ success: true, data: { book: errResponse.data[0], barcode: decodedText }, barcode: decodedText, isSearch: true });
        } else {
          setResult({ success: false, message: `Barcode "${decodedText}" not found in the library.` });
        }
      } catch {
        setResult({ success: false, message: `Barcode "${decodedText}" not found.` });
      }
    } finally {
      setProcessing(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setError('');
  };

  const copyBarcode = (barcode) => {
    navigator.clipboard.writeText(barcode).catch(() => {});
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
                    Point your camera at the library barcode on the book to look it up.
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
                  <p className="mt-3">Looking up book...</p>
                </div>
              )}

              {error && !result && (
                <AlertMessage variant="danger" message={error} />
              )}

              {result && (
                <div className="text-center py-3">
                  {result.success ? (
                    <>
                      <FiCheckCircle size={48} className="text-success mb-3" />
                      <Alert variant="success">
                        <strong>Book Found!</strong>
                        {result.data?.bookTitle && <p className="mb-1 mt-2">Title: {result.data.bookTitle}</p>}
                        {result.data?.book?.title && <p className="mb-1 mt-2">Title: {result.data.book.title}</p>}
                        {result.data?.floor && <p className="mb-1">Location: Floor {result.data.floor}, Section {result.data.section}, Shelf {result.data.shelf}</p>}
                        <p className="mb-0 mt-2"><code>{result.barcode}</code></p>
                      </Alert>
                      <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                        <Button variant="outline-primary" size="sm" onClick={() => copyBarcode(result.barcode)}>
                          Copy Barcode
                        </Button>
                        <Button variant="primary" size="sm" onClick={resetScanner}>
                          Scan Another
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <FiXCircle size={48} className="text-danger mb-3" />
                      <Alert variant="danger">{result.message}</Alert>
                      <Button variant="primary" onClick={resetScanner}>
                        Try Again
                      </Button>
                    </>
                  )}
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
