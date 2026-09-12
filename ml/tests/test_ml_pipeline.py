"""
Unit & Integration Tests for SignBridge AI ML Pipeline.
"""

import sys
import unittest
import numpy as np
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(PROJECT_ROOT))

from ml.dataset.dataset_loader import load_labels, get_class_names, generate_synthetic_benchmark_landmarks
from ml.preprocessing.features import extract_landmark_features, calculate_angle_3d
from ml.inference.predict import ISLGesturePredictor

class TestISLMLPipeline(unittest.TestCase):
    def test_labels_catalog(self):
        """Verify labels catalog contains all required classes."""
        classes = get_class_names()
        self.assertGreaterEqual(len(classes), 60)
        # Check Alphabet A-Z
        for char in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
            self.assertIn(char, classes, f"Missing alphabet sign: {char}")
        # Check Numbers 0-9
        for num in "0123456789":
            self.assertIn(num, classes, f"Missing number sign: {num}")
        # Check Common Signs
        for common in ["HELLO", "THANK_YOU", "HELP", "WATER", "YES", "NO", "PLEASE"]:
            self.assertIn(common, classes, f"Missing common sign: {common}")

    def test_feature_engineering_invariance(self):
        """Verify 83-dimensional feature extraction with scale & translation invariance."""
        # 1. Base hand
        base_landmarks = np.random.uniform(0.1, 0.8, (21, 3)).astype(np.float32)
        base_landmarks[0] = [0.2, 0.3, 0.1] # Wrist offset
        
        feats_1 = extract_landmark_features(base_landmarks)
        self.assertEqual(feats_1.shape, (83,))
        self.assertFalse(np.isnan(feats_1).any())

        # 2. Translated hand (shift whole hand by +10.0 on all axes)
        shifted_landmarks = base_landmarks + 10.0
        feats_2 = extract_landmark_features(shifted_landmarks)

        # Coordinate features (first 63) should be identical despite translation
        np.testing.assert_allclose(feats_1[:63], feats_2[:63], rtol=1e-4, atol=1e-4)

    def test_predictor_response_structure(self):
        """Verify prediction schema and graceful hand detection."""
        predictor = ISLGesturePredictor()
        
        # Test None / empty input
        res_empty = predictor.predict_landmarks(None)
        self.assertFalse(res_empty["hand_detected"])
        self.assertIsNone(res_empty["gesture"])

        # Test valid synthetic landmarks
        test_hand = np.random.uniform(0.1, 0.8, (21, 3)).astype(np.float32)
        test_hand[0] = [0.0, 0.0, 0.0]
        res_pred = predictor.predict_landmarks(test_hand)
        
        self.assertTrue(res_pred["hand_detected"])
        self.assertIn("confidence", res_pred)
        self.assertIn("confidence_percent", res_pred)
        self.assertIn("category", res_pred)
        self.assertIn("model_status", res_pred)

if __name__ == "__main__":
    unittest.main()
