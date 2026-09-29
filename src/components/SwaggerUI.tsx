import React, { useState } from 'react';
import { predictIrisSVM, batchPredictSVM } from '../utils/svmModel';
import { MODEL_VERSIONS } from '../data/modelVersions';
import {
  FileCode,
  ChevronDown,
  ChevronRight,
  Play,
  Copy,
  Check,
  Download,
  Server,
  Terminal,
  Layers,
} from 'lucide-react';

export const SwaggerUI: React.FC = () => {
  // Trạng thái mở accordion của các endpoint
  const [openEndpoint, setOpenEndpoint] = useState<string | null>('post-predict');

  // Trạng thái Try it out
  const [tryOutState, setTryOutState] = useState<Record<string, boolean>>({
    'post-predict': true,
    'post-batch': false,
    'get-models': false,
    'get-health': false,
  });

  // Request bodies cho try it out
  const [predictBody, setPredictBody] = useState(
    JSON.stringify(
      {
        sepal_length: 5.8,
        sepal_width: 3.0,
        petal_length: 4.2,
        petal_width: 1.3,
        model_version: 'v1.0-rbf',
      },
      null,
      2
    )
  );

  const [batchBody, setBatchBody] = useState(
    JSON.stringify(
      {
        samples: [
          { sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2 },
          { sepal_length: 6.2, sepal_width: 2.8, petal_length: 4.8, petal_width: 1.8 },
        ],
        model_version: 'v1.0-rbf',
      },
      null,
      2
    )
  );

  // Response simulation state
  const [responses, setResponses] = useState<Record<string, { status: number; body: string; latency: number } | null>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleEndpoint = (key: string) => {
    setOpenEndpoint(openEndpoint === key ? null : key);
  };

  const toggleTryOut = (key: string) => {
    setTryOutState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Thực thi thử nghiệm Execute
  const executePredict = () => {
    const start = performance.now();
    try {
      const parsed = JSON.parse(predictBody);
      const res = predictIrisSVM(
        {
          sepalLength: parsed.sepal_length || 5.8,
          sepalWidth: parsed.sepal_width || 3.0,
          petalLength: parsed.petal_length || 4.2,
          petalWidth: parsed.petal_width || 1.3,
        },
        parsed.model_version || 'v1.0-rbf'
      );
      const elapsed = Math.round(performance.now() - start + 1.2);
      setResponses((prev) => ({
        ...prev,
        'post-predict': {
          status: 200,
          body: JSON.stringify(
            {
              status: 'success',
              model_version: parsed.model_version || 'v1.0-rbf',
              prediction: {
                species: `Iris ${res.predictedSpecies}`,
                class_id: res.predictedClassId,
                confidence: res.confidence,
                probabilities: res.probabilities,
              },
              inference_time_ms: elapsed,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
          latency: elapsed,
        },
      }));
    } catch {
      setResponses((prev) => ({
        ...prev,
        'post-predict': {
          status: 422,
          body: JSON.stringify(
            { detail: [{ loc: ['body'], msg: 'Invalid JSON payload structure', type: 'value_error' }] },
            null,
            2
          ),
          latency: 1,
        },
      }));
    }
  };

  const executeBatch = () => {
    const start = performance.now();
    try {
      const parsed = JSON.parse(batchBody);
      const rows = (parsed.samples || []).map((s: Record<string, number>) => ({
        sepalLength: s.sepal_length || 5.0,
        sepalWidth: s.sepal_width || 3.0,
        petalLength: s.petal_length || 1.5,
        petalWidth: s.petal_width || 0.2,
      }));
      const results = batchPredictSVM(rows, parsed.model_version || 'v1.0-rbf');
      const elapsed = Math.round(performance.now() - start + 2.4);

      setResponses((prev) => ({
        ...prev,
        'post-batch': {
          status: 200,
          body: JSON.stringify(
            {
              status: 'success',
              model_version: parsed.model_version || 'v1.0-rbf',
              total_samples: results.length,
              predictions: results.map((r) => ({
                id: r.id,
                species: `Iris ${r.predictedSpecies}`,
                confidence: r.confidence,
                probabilities: r.probabilities,
              })),
              inference_time_ms: elapsed,
            },
            null,
            2
          ),
          latency: elapsed,
        },
      }));
    } catch {
      setResponses((prev) => ({
        ...prev,
        'post-batch': {
          status: 422,
          body: JSON.stringify(
            { detail: [{ loc: ['body'], msg: 'Invalid JSON array in samples', type: 'value_error' }] },
            null,
            2
          ),
          latency: 1,
        },
      }));
    }
  };

  const executeGetModels = () => {
    setResponses((prev) => ({
      ...prev,
      'get-models': {
        status: 200,
        body: JSON.stringify(
          {
            status: 'success',
            active_default: 'v1.0-rbf',
            available_models: MODEL_VERSIONS,
          },
          null,
          2
        ),
        latency: 0.8,
      },
    }));
  };

  const executeGetHealth = () => {
    setResponses((prev) => ({
      ...prev,
      'get-health': {
        status: 200,
        body: JSON.stringify(
          {
            status: 'healthy',
            framework: 'FastAPI 0.110.0',
            svm_engine: 'scikit-learn 1.4.1 (RBF/Linear/Poly)',
            uptime_seconds: 142850,
            active_workers: 4,
          },
          null,
          2
        ),
        latency: 0.5,
      },
    }));
  };

  // Tải về OpenAPI Schema JSON
  const handleDownloadOpenAPI = () => {
    const schema = {
      openapi: '3.1.0',
      info: {
        title: 'Iris SVM Machine Learning Classifier API',
        description: 'FastAPI Swagger Documentation for Iris SVM Classifier Service',
        version: '1.0.0',
      },
      paths: {
        '/api/v1/predict': {
          post: {
            summary: 'Dự đoán phân loại hoa Iris đơn lẻ',
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
          },
        },
        '/api/v1/batch-predict': {
          post: {
            summary: 'Dự đoán phân loại hoa Iris theo mảng batch',
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
          },
        },
        '/api/v1/models': {
          get: { summary: 'Liệt kê danh sách các phiên bản mô hình SVM' },
        },
        '/api/v1/health': {
          get: { summary: 'Kiểm tra trạng thái hệ thống' },
        },
      },
    };
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'openapi.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="swagger-ui-container" className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Swagger Header Banner */}
      <div className="bg-[#1b1b1b] text-white p-5 border-b border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center font-mono font-bold text-lg">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold tracking-tight text-white font-sans">
                  Iris SVM Classifier API
                </h2>
                <span className="text-[10px] font-mono font-bold bg-teal-500 text-slate-950 px-2 py-0.5 rounded-sm">
                  FastAPI
                </span>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-sm">
                  OAS 3.1.0
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                /api/v1 &bull; RESTful Microservice cho suy luận SVM độ trễ thấp
              </p>
            </div>
          </div>

          <button
            id="btn-download-openapi-json"
            onClick={handleDownloadOpenAPI}
            className="flex items-center gap-1.5 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-lg border border-neutral-700 transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>openapi.json</span>
          </button>
        </div>
      </div>

      {/* Main Endpoints Section */}
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" />
            <span>Inference &amp; Model Operations</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">4 endpoints</span>
        </div>

        {/* 1. POST /api/v1/predict */}
        <div className="border border-blue-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => toggleEndpoint('post-predict')}
            className="w-full flex items-center justify-between p-3 bg-blue-50/70 hover:bg-blue-50 border-b border-blue-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-mono text-xs font-bold uppercase">
                POST
              </span>
              <span className="font-mono text-xs font-bold text-slate-900">
                /api/v1/predict
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Dự đoán phân loại hoa Iris đơn lẻ
              </span>
            </div>
            {openEndpoint === 'post-predict' ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {openEndpoint === 'post-predict' && (
            <div className="p-4 bg-blue-50/20 text-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600">
                  Gửi 4 đặc trưng hình thái để mô hình SVM trả về nhãn loài hoa và xác suất Platt Scaling.
                </span>
                <button
                  type="button"
                  onClick={() => toggleTryOut('post-predict')}
                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-700 transition-all text-xs"
                >
                  {tryOutState['post-predict'] ? 'Cancel' : 'Try it out'}
                </button>
              </div>

              {/* Request Body */}
              <div className="mb-4">
                <div className="font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Request body (application/json):</span>
                  <button
                    onClick={() => handleCopy(predictBody, 'predict-req')}
                    className="text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    {copiedKey === 'predict-req' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'predict-req' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={predictBody}
                  disabled={!tryOutState['post-predict']}
                  onChange={(e) => setPredictBody(e.target.value)}
                  className="w-full font-mono text-xs bg-slate-900 text-emerald-400 p-3 rounded-xl border border-slate-800 focus:outline-hidden"
                />
              </div>

              {tryOutState['post-predict'] && (
                <button
                  type="button"
                  onClick={executePredict}
                  className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Execute (Thực Thi)</span>
                </button>
              )}

              {/* Response Output */}
              {responses['post-predict'] && (
                <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-white">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">
                        Status: {responses['post-predict'].status} OK
                      </span>
                      <span>&bull; Latency: {responses['post-predict'].latency}ms</span>
                    </div>
                    <button
                      onClick={() => handleCopy(responses['post-predict']!.body, 'predict-res')}
                      className="hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'predict-res' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Response</span>
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-slate-200 overflow-x-auto">
                    {responses['post-predict'].body}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. POST /api/v1/batch-predict */}
        <div className="border border-blue-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => toggleEndpoint('post-batch')}
            className="w-full flex items-center justify-between p-3 bg-blue-50/70 hover:bg-blue-50 border-b border-blue-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-mono text-xs font-bold uppercase">
                POST
              </span>
              <span className="font-mono text-xs font-bold text-slate-900">
                /api/v1/batch-predict
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Dự đoán hàng loạt theo danh sách mẫu (Batch)
              </span>
            </div>
            {openEndpoint === 'post-batch' ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {openEndpoint === 'post-batch' && (
            <div className="p-4 bg-blue-50/20 text-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600">
                  Xử lý vector hóa hàng loạt mẫu hoa đầu vào, hỗ trợ định dạng mảng JSON tối ưu hóa I/O.
                </span>
                <button
                  type="button"
                  onClick={() => toggleTryOut('post-batch')}
                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-700 transition-all text-xs"
                >
                  {tryOutState['post-batch'] ? 'Cancel' : 'Try it out'}
                </button>
              </div>

              <div className="mb-4">
                <div className="font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Request body (application/json):</span>
                  <button
                    onClick={() => handleCopy(batchBody, 'batch-req')}
                    className="text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    {copiedKey === 'batch-req' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>Sao chép</span>
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={batchBody}
                  disabled={!tryOutState['post-batch']}
                  onChange={(e) => setBatchBody(e.target.value)}
                  className="w-full font-mono text-xs bg-slate-900 text-emerald-400 p-3 rounded-xl border border-slate-800 focus:outline-hidden"
                />
              </div>

              {tryOutState['post-batch'] && (
                <button
                  type="button"
                  onClick={executeBatch}
                  className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Execute Batch</span>
                </button>
              )}

              {responses['post-batch'] && (
                <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-white">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 pb-2 border-b border-slate-800">
                    <span className="text-emerald-400 font-bold">
                      Status: {responses['post-batch'].status} OK ({responses['post-batch'].latency}ms)
                    </span>
                    <button
                      onClick={() => handleCopy(responses['post-batch']!.body, 'batch-res')}
                      className="hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'batch-res' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Response</span>
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-slate-200 overflow-x-auto">
                    {responses['post-batch'].body}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. GET /api/v1/models */}
        <div className="border border-emerald-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => toggleEndpoint('get-models')}
            className="w-full flex items-center justify-between p-3 bg-emerald-50/70 hover:bg-emerald-50 border-b border-emerald-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-mono text-xs font-bold uppercase">
                GET
              </span>
              <span className="font-mono text-xs font-bold text-slate-900">
                /api/v1/models
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Danh sách các phiên bản mô hình SVM và siêu tham số
              </span>
            </div>
            {openEndpoint === 'get-models' ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {openEndpoint === 'get-models' && (
            <div className="p-4 bg-emerald-50/20 text-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600">
                  Trả về metadata các mô hình đã huấn luyện (RBF, Linear, Polynomial), chỉ số đo lường và độ trễ.
                </span>
                <button
                  type="button"
                  onClick={executeGetModels}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Execute GET</span>
                </button>
              </div>

              {responses['get-models'] && (
                <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-white">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 pb-2 border-b border-slate-800">
                    <span className="text-emerald-400 font-bold">Status: 200 OK</span>
                    <button
                      onClick={() => handleCopy(responses['get-models']!.body, 'models-res')}
                      className="hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'models-res' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-slate-200 overflow-x-auto">
                    {responses['get-models'].body}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. GET /api/v1/health */}
        <div className="border border-emerald-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => toggleEndpoint('get-health')}
            className="w-full flex items-center justify-between p-3 bg-emerald-50/70 hover:bg-emerald-50 border-b border-emerald-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-mono text-xs font-bold uppercase">
                GET
              </span>
              <span className="font-mono text-xs font-bold text-slate-900">
                /api/v1/health
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Kiểm tra trạng thái Service và Uptime
              </span>
            </div>
            {openEndpoint === 'get-health' ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {openEndpoint === 'get-health' && (
            <div className="p-4 bg-emerald-50/20 text-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600">
                  Endpoint giám sát liveness/readiness probe cho Kubernetes hoặc container Cloud Run.
                </span>
                <button
                  type="button"
                  onClick={executeGetHealth}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Execute GET</span>
                </button>
              </div>

              {responses['get-health'] && (
                <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-white">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 pb-2 border-b border-slate-800">
                    <span className="text-emerald-400 font-bold">Status: 200 OK</span>
                    <button
                      onClick={() => handleCopy(responses['get-health']!.body, 'health-res')}
                      className="hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'health-res' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-slate-200 overflow-x-auto">
                    {responses['get-health'].body}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
