import { readSession } from '../auth.js';

window.location.replace(readSession() ? '/tickets/' : '/signin/');
