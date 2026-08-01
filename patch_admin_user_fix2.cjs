const fs = require('fs');
const file = 'src/components/AdminUserManagement.tsx';
let code = fs.readFileSync(file, 'utf8');

// Fix the trailing garbage at the end
code = code.replace(/<\/div>\s*\}\)\}\s*<\/div>\s*\}\)\s*<\/div>\s*\);\s*\}/, '</div>\n        ))}\n      </div>\n      </>\n      )}\n    </div>\n  );\n}');

code = code.replace(/<\/div>\s*\}\)\}\s*<\/div>\s*\}\)\s*<\/div>\s*\}\)\s*<\/div>\s*\);\s*\}/g, '</div>\n        ))}\n      </div>\n      </>\n      )}\n    </div>\n  );\n}');

code = code.replace(/<\/div>\n      \)\}\n    <\/div>\n  \);\n\}/, '</div>\n      </>\n      )}\n    </div>\n  );\n}');

fs.writeFileSync(file, code);
