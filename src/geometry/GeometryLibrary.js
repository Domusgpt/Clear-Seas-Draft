/**
 * VIB3 Geometry Library
 * 8 geometric types with 4D polytopal mathematics integration
 * WebGL 1.0 compatible shaders only
 */

export class GeometryLibrary {
    static getGeometryNames() {
        return [
            'TETRAHEDRON',
            'HYPERCUBE', 
            'SPHERE',
            'TORUS',
            'KLEIN BOTTLE',
            'FRACTAL',
            'WAVE',
            'CRYSTAL'
        ];
    }
    
    static getGeometryName(type) {
        const names = this.getGeometryNames();
        return names[type] || 'UNKNOWN';
    }
    
    /**
     * Get variation parameters for specific geometry and level
     */
    static getVariationParameters(geometryType, level) {
        const baseParams = {
            gridDensity: 8 + (level * 4),
            morphFactor: 0.5 + (level * 0.3),
            chaos: level * 0.15,
            speed: 0.8 + (level * 0.2),
            hue: (geometryType * 45 + level * 15) % 360
        };
        
        // Geometry-specific adjustments
        switch (geometryType) {
            case 0: // Tetrahedron
                baseParams.gridDensity *= 1.2;
                break;
            case 1: // Hypercube
                baseParams.morphFactor *= 0.8;
                break;
            case 2: // Sphere
                baseParams.chaos *= 1.5;
                break;
            case 3: // Torus
                baseParams.speed *= 1.3;
                break;
            case 4: // Klein Bottle
                baseParams.gridDensity *= 0.7;
                baseParams.morphFactor *= 1.4;
                break;
            case 5: // Fractal
                baseParams.gridDensity *= 0.5;
                baseParams.chaos *= 2.0;
                break;
            case 6: // Wave
                baseParams.speed *= 1.8;
                baseParams.chaos *= 0.5;
                break;
            case 7: // Crystal
                baseParams.gridDensity *= 1.5;
                baseParams.morphFactor *= 0.6;
                break;
        }
        
        return baseParams;
    }
}