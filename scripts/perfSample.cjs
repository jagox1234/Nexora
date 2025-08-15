// Simple performance sample using logger mark/measure
import { mark, measure } from '../Nexora v2/core/utils.js';

mark('boot');
setTimeout(() => {
  measure('boot_duration','boot');
}, 50);
