import comfortIndexService from '../src/services/comfortIndexService';
import { ProcessedWeatherData } from '../src/types';

/**
 * Test Suite for Comfort Index Service
 * Tests the comfort index calculation algorithm based on:
 * - Temperature (45% weight)
 * - Humidity (30% weight)
 * - Wind Speed (25% weight)
 */
describe('ComfortIndexServiceTest', () => {
  
  // Test Fixtures
  let optimalConditions: ProcessedWeatherData;
  let extremeHeatConditions: ProcessedWeatherData;
  let extremeColdConditions: ProcessedWeatherData;
  let highHumidityConditions: ProcessedWeatherData;
  let lowHumidityConditions: ProcessedWeatherData;
  let calmWindConditions: ProcessedWeatherData;
  let highWindConditions: ProcessedWeatherData;

  beforeEach(() => {
    // Setup common test data
    optimalConditions = {
      cityId: '1',
      cityName: 'Test City',
      temperature: 22,
      humidity: 50,
      windSpeed: 3,
      description: 'Clear',
      cloudiness: 0,
      pressure: 1013,
    };

    extremeHeatConditions = {
      ...optimalConditions,
      cityId: '2',
      cityName: 'Hot City',
      temperature: 40,
    };

    extremeColdConditions = {
      ...optimalConditions,
      cityId: '3',
      cityName: 'Cold City',
      temperature: 0,
    };

    highHumidityConditions = {
      ...optimalConditions,
      cityId: '4',
      cityName: 'Humid City',
      humidity: 90,
    };

    lowHumidityConditions = {
      ...optimalConditions,
      cityId: '5',
      cityName: 'Dry City',
      humidity: 10,
    };

    calmWindConditions = {
      ...optimalConditions,
      cityId: '6',
      cityName: 'Calm City',
      windSpeed: 0,
    };

    highWindConditions = {
      ...optimalConditions,
      cityId: '7',
      cityName: 'Windy City',
      windSpeed: 10,
    };
  });

  // Test Class: Optimal Conditions
  describe('whenConditionsAreOptimal', () => {
    
    test('shouldReturnPerfectScore', () => {
      // Act
      const score = comfortIndexService.calculateComfortIndex(optimalConditions);
      
      // Assert
      expect(score).toBeGreaterThanOrEqual(95);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('shouldProvideDetailedBreakdownWithHighScores', () => {
      // Act
      const breakdown = comfortIndexService.calculateComfortIndexWithBreakdown(optimalConditions);
      
      // Assert
      expect(breakdown.temperatureScore).toBeGreaterThanOrEqual(95);
      expect(breakdown.humidityScore).toBeGreaterThanOrEqual(95);
      expect(breakdown.windSpeedScore).toBeGreaterThanOrEqual(95);
      expect(breakdown.finalScore).toBeGreaterThanOrEqual(95);
    });
  });

  // Test Class: Temperature Impact
  describe('whenTemperatureVaries', () => {
    
    test('shouldPenalizeExtremeHeat', () => {
      // Act
      const score = comfortIndexService.calculateComfortIndex(extremeHeatConditions);
      
      // Assert
      expect(score).toBeLessThan(60);
    });

    test('shouldPenalizeExtremeCold', () => {
      // Act
      const score = comfortIndexService.calculateComfortIndex(extremeColdConditions);
      
      // Assert
      expect(score).toBeLessThan(60);
    });

    test('shouldGiveGoodScoreForComfortableTemperature', () => {
      // Arrange
      const comfortableTemp = { ...optimalConditions, temperature: 24 };
      
      // Act
      const score = comfortIndexService.calculateComfortIndex(comfortableTemp);
      
      // Assert
      expect(score).toBeGreaterThan(80);
    });

    test('shouldHandleNegativeTemperature', () => {
      // Arrange
      const freezing = { ...optimalConditions, temperature: -10 };
      
      // Act
      const score = comfortIndexService.calculateComfortIndex(freezing);
      
      // Assert
      expect(score).toBeLessThan(60); // Still gets points from optimal humidity & wind
    });
  });

  // Test Class: Humidity Impact
  describe('whenHumidityVaries', () => {
    
    test('shouldPenalizeVeryHighHumidity', () => {
      // Act
      const score = comfortIndexService.calculateComfortIndex(highHumidityConditions);
      
      // Assert
      expect(score).toBeLessThanOrEqual(70);
    });

    test('shouldPenalizeVeryLowHumidity', () => {
      // Act
      const score = comfortIndexService.calculateComfortIndex(lowHumidityConditions);
      
      // Assert
      expect(score).toBeLessThanOrEqual(70);
    });

    test('shouldAcceptModerateHumidity', () => {
      // Arrange
      const moderateHumidity = { ...optimalConditions, humidity: 60 };
      
      // Act
      const score = comfortIndexService.calculateComfortIndex(moderateHumidity);
      
      // Assert
      expect(score).toBeGreaterThan(80);
    });
  });

  // Test Class: Wind Speed Impact
  describe('whenWindSpeedVaries', () => {
    
    test('shouldPenalizeCalmAir', () => {
      // Act
      const score = comfortIndexService.calculateComfortIndex(calmWindConditions);
      
      // Assert
      expect(score).toBeLessThan(90);
    });

    test('shouldPenalizeVeryWindyConditions', () => {
      // Act
      const score = comfortIndexService.calculateComfortIndex(highWindConditions);
      
      // Assert
      expect(score).toBeLessThan(80);
    });

    test('shouldAcceptModerateWind', () => {
      // Arrange
      const moderateWind = { ...optimalConditions, windSpeed: 2.5 };
      
      // Act
      const score = comfortIndexService.calculateComfortIndex(moderateWind);
      
      // Assert
      expect(score).toBeGreaterThan(85);
    });
  });

  // Test Class: Score Boundaries
  describe('whenCalculatingScore', () => {
    
    test('shouldAlwaysReturnScoreBetweenZeroAndOneHundred', () => {
      // Arrange
      const extremeConditions: ProcessedWeatherData = {
        cityId: '8',
        cityName: 'Extreme City',
        temperature: 50,
        humidity: 100,
        windSpeed: 20,
        description: 'Extreme',
        cloudiness: 100,
        pressure: 950,
      };
      
      // Act
      const score = comfortIndexService.calculateComfortIndex(extremeConditions);
      
      // Assert
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('shouldReturnWholeNumbersOnly', () => {
      // Arrange
      const decimalInputs: ProcessedWeatherData = {
        cityId: '9',
        cityName: 'Decimal Test',
        temperature: 23.5,
        humidity: 55.7,
        windSpeed: 2.8,
        description: 'Clear',
        cloudiness: 0,
        pressure: 1013,
      };
      
      // Act
      const score = comfortIndexService.calculateComfortIndex(decimalInputs);
      
      // Assert
      expect(score).toBe(Math.floor(score));
      expect(Number.isInteger(score)).toBe(true);
    });
  });

  // Test Class: Score Explanations
  describe('whenGettingScoreExplanation', () => {
    
    test('shouldProvideExcellentExplanationForHighScores', () => {
      // Act
      const explanation = comfortIndexService.getScoreExplanation(85);
      
      // Assert
      expect(explanation).toContain('Excellent');
    });

    test('shouldProvideGoodExplanationForModerateScores', () => {
      // Act
      const explanation = comfortIndexService.getScoreExplanation(65);
      
      // Assert
      expect(explanation).toContain('Good');
    });

    test('shouldProvidePoorExplanationForLowScores', () => {
      // Act
      const explanation = comfortIndexService.getScoreExplanation(25);
      
      // Assert
      expect(explanation).toContain('Poor');
    });

    test('shouldProvideVeryUncomfortableExplanationForVeryLowScores', () => {
      // Act
      const explanation = comfortIndexService.getScoreExplanation(5);
      
      // Assert
      expect(explanation).toContain('Very uncomfortable');
    });
  });

  // Test Class: Real-World Scenarios
  describe('whenTestingRealWorldScenarios', () => {
    
    test('shouldRankTropicalClimateAsModeratelyUncomfortable', () => {
      // Arrange - Typical Colombo, Sri Lanka conditions
      const tropical: ProcessedWeatherData = {
        cityId: '10',
        cityName: 'Colombo',
        temperature: 33,
        humidity: 70,
        windSpeed: 3.2,
        description: 'Cloudy',
        cloudiness: 50,
        pressure: 1010,
      };
      
      // Act
      const score = comfortIndexService.calculateComfortIndex(tropical);
      
      // Assert
      expect(score).toBeGreaterThan(20);
      expect(score).toBeLessThan(70);
    });

    test('shouldRankTemperateClimateAsComfortable', () => {
      // Arrange - Typical Paris spring conditions
      const temperate: ProcessedWeatherData = {
        cityId: '11',
        cityName: 'Paris',
        temperature: 22.4,
        humidity: 60,
        windSpeed: 2.5,
        description: 'Clear',
        cloudiness: 10,
        pressure: 1015,
      };
      
      // Act
      const score = comfortIndexService.calculateComfortIndex(temperate);
      
      // Assert
      expect(score).toBeGreaterThan(70);
    });

    test('shouldRankColdClimateAsUncomfortable', () => {
      // Arrange - Typical Oslo winter conditions
      const cold: ProcessedWeatherData = {
        cityId: '12',
        cityName: 'Oslo',
        temperature: -3.9,
        humidity: 80,
        windSpeed: 4,
        description: 'Clear',
        cloudiness: 0,
        pressure: 1020,
      };
      
      // Act
      const score = comfortIndexService.calculateComfortIndex(cold);
      
      // Assert
      expect(score).toBeLessThan(40);
    });
  });

  // Test Class: Edge Cases
  describe('whenTestingEdgeCases', () => {
    
    test('shouldHandleZeroValuesForAllParameters', () => {
      // Arrange
      const allZeros: ProcessedWeatherData = {
        cityId: '13',
        cityName: 'Zero Test',
        temperature: 0,
        humidity: 0,
        windSpeed: 0,
        description: 'Clear',
        cloudiness: 0,
        pressure: 1013,
      };
      
      // Act
      const score = comfortIndexService.calculateComfortIndex(allZeros);
      
      // Assert
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('shouldHandleMaximumValuesForAllParameters', () => {
      // Arrange
      const maxValues: ProcessedWeatherData = {
        cityId: '14',
        cityName: 'Max Test',
        temperature: 100,
        humidity: 100,
        windSpeed: 50,
        description: 'Extreme',
        cloudiness: 100,
        pressure: 1100,
      };
      
      // Act
      const score = comfortIndexService.calculateComfortIndex(maxValues);
      
      // Assert
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
