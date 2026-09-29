export type IrisSpecies = 'setosa' | 'versicolor' | 'virginica';

export interface IrisSample {
  sepalLength: number;
  sepalWidth: number;
  petalLength: number;
  petalWidth: number;
  species: IrisSpecies;
  speciesId: number; // 0, 1, 2
}

export interface UserInputFeatures {
  sepalLength: number;
  sepalWidth: number;
  petalLength: number;
  petalWidth: number;
}

export interface PredictionResult {
  predictedSpecies: IrisSpecies;
  predictedClassId: number;
  confidence: number; // 0 - 100
  probabilities: {
    setosa: number;
    versicolor: number;
    virginica: number;
  };
  decisionDistance?: number;
}

export interface SpeciesStats {
  name: string;
  scientificName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  means: {
    sepalLength: number;
    sepalWidth: number;
    petalLength: number;
    petalWidth: number;
  };
  description: string;
}

export type ModelVersionId = 'v1.0-rbf' | 'v1.1-linear' | 'v2.0-poly' | 'v2.1-sigmoid' | 'v3.0-precomputed';

export type SvmKernelType = 'rbf' | 'linear' | 'poly' | 'sigmoid' | 'precomputed';

export interface ModelVersion {
  id: ModelVersionId;
  name: string;
  kernel: SvmKernelType;
  kernelDisplay: string;
  c: number;
  gamma?: string;
  degree?: number;
  coef0?: number;
  accuracy: number;
  latencyMs: number;
  description: string;
  status: 'production' | 'staging' | 'active';
  releaseDate: string;
}

export interface AuthUser {
  username: string;
  name?: string;
  isGuest: boolean;
  loggedInAt: string;
}

export interface BatchPredictionRow {
  id: number;
  sepalLength: number;
  sepalWidth: number;
  petalLength: number;
  petalWidth: number;
  predictedSpecies: IrisSpecies;
  confidence: number;
  probabilities: {
    setosa: number;
    versicolor: number;
    virginica: number;
  };
}

