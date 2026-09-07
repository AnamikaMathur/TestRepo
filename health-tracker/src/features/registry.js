import waterFeature from './water'
import weightFeature from './weight'
import sleepFeature from './sleep'

/**
 * Feature registry — add a new feature by:
 * 1. Creating src/features/<name>/index.js  (exports { id, label, icon, path, component })
 * 2. Importing it here and pushing it to this array
 */
const features = [waterFeature, weightFeature, sleepFeature]

export default features
