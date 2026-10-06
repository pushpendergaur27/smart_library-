import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { Html5Qrcode } from 'html5-qrcode';
import { FiCamera, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../services/api';

const SCAN_CONFIG = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };

const describeCameraError = (err) => {
  const name = (err && err.name) || '';
  const raw = (err && err.message) ? err.message : String(err || '');
  const text = `${name} ${raw}`.toLowerCase();
  const isBrave = typeof navigator !== 'undefined' && !!navigator.brave;
  const isWindows = typeof navigator !== 'undefined' && /win/i.test(navigator.platform || navigator.userAgent || '');

  if (typeof navigator !== 'undefined' &&
      (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function')) {
    return 'Camera is not available in this browser context.\nOpen the site directly over HTTPS (https://...) in a normal tab — not inside an embedded preview frame — and try again.';
  }
  if (text.includes('notallowed') || text.includes('permission') || text.includes('denied') || name === 'SecurityError') {
    let msg = 'Camera permission is blocked, so the browser refused to open the camera.\n';
    msg += '1) Click the tune / site-settings icon in the address bar, set Camera to "Allow", then press Start Scanner.\n';
    if (isBrave) {
      msg += '2) Brave users: also click the Shields (lion) icon in the address bar and turn Shields OFF for this site — fingerprinting protection blocks the camera even when the permission toggle says Allowed.\n';
    }
    if (isWindows) {
      msg += `${isBrave ? '3' : '2'}) Windows: open Settings > Privacy & security > Camera and turn on "Let apps access camera", then allow your browser.\n`;
    }
    msg += `${isWindows ? '4' : '3'}) Close any other app that may be using the camera (video calls, webcam tools), then press Start Scanner.`;
    return msg;
  }
  if (text.includes('notreadable') || text.includes('in use') || text.includes('trackstart')) {
    return 'The camera is being used by another app.\nClose other video/camera apps and press Start Scanner again.';
  }
  if (text.includes('notfound') || text.includes('no camera') || text.includes('requested device')) {
    return 'No camera was found on this device.\nConnect a camera (or allow your device to expose it) and press Start Scanner.';
  }
  if (text.includes('overconstrained')) {
    return 'No camera matched the requested settings.\nPress Start Scanner to retry with your default camera.';
  }
  if (text.includes('missing html element')) {
    return 'The scanner view was not ready yet.\nPress Start Scanner to retry.';
  }
  if (text.includes('insecure') || text.includes('secure context')) {
    return 'Camera access requires HTTPS.\nOpen the site with https:// and try again.';
  }
  return `Could not start the camera: ${raw || 'unknown error'}.\nPress Start Scanner to retry.`;
};

const ScanBarcode = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const onScanSuccess = async (decodedText) => {
    setScanning(false);
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

  const onScanSuccessRef = useRef(onScanSuccess);
  onScanSuccessRef.current = onScanSuccess;

  useEffect(() => {
    setScanning(true);
  }, []);

  useEffect(() => {
    if (!scanning) return undefined;
    let cancelled = false;

    const startCamera = async () => {
      try {
        if (typeof navigator === 'undefined' ||
            !navigator.mediaDevices ||
            typeof navigator.mediaDevices.getUserMedia !== 'function') {
          const e = new Error('getUserMedia is unavailable (insecure context or unsupported browser)');
          e.name = 'SecurityError';
          throw e;
        }

        const instance = new Html5Qrcode('scanner-reader', false);
        html5QrCodeRef.current = instance;

        try {
          await instance.start(
            { facingMode: 'environment' },
            SCAN_CONFIG,
            (decodedText) => onScanSuccessRef.current(decodedText),
            () => {}
          );
        } catch (firstErr) {
          const firstName = (firstErr && firstErr.name) || '';
          const firstMsg = (firstErr && firstErr.message) || String(firstErr || '');
          if (firstName === 'OverconstrainedError' || /overconstrained/i.test(firstMsg)) {
            await instance.start(
              { facingMode: 'user' },
              SCAN_CONFIG,
              (decodedText) => onScanSuccessRef.current(decodedText),
              () => {}
            );
          } else {
            throw firstErr;
          }
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Camera start failed:', err);
        setError(describeCameraError(err));
        setScanning(false);
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      const instance = html5QrCodeRef.current;
      html5QrCodeRef.current = null;
      if (instance) {
        try {
          const p = instance.stop();
          if (p && typeof p.then === 'function') {
            p.then(() => { try { instance.clear(); } catch (e) {} })
              .catch(() => { try { instance.clear(); } catch (e) {} });
          } else {
            try { instance.clear(); } catch (e) {}
          }
        } catch (e) {
          try { instance.clear(); } catch (e2) {}
        }
      }
    };
  }, [scanning]);

  const startScanning = () => {
    setError('');
    setResult(null);
    setScanning(true);
  };

  const stopScanning = () => {
    setScanning(false);
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
              {!scanning && !result && !processing && (
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
                  <p className="text-muted small mt-2 mb-0">
                    Allow camera access when prompted, then hold the barcode inside the frame.
                  </p>
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

              {error && !result && !scanning && (
                <Alert variant="danger" className="text-start mt-3" style={{ whiteSpace: 'pre-line' }}>
                  {error}
                </Alert>
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
