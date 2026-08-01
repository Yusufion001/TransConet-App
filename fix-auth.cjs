const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src/context/AuthContext.tsx');
let text = fs.readFileSync(p, 'utf8');

const newEffect = `  useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          fetchUserRole(session.user.id);
        } else {
          setIsLoading(false);
        }
      }).catch(err => {
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session?.user) {
          fetchUserRole(session.user.id);
        } else {
          setRole(null);
          setIsLoading(false);
        }
      });
      return () => subscription?.unsubscribe();
    } catch (err) {
      setIsLoading(false);
    }
  }, []);`;

text = text.replace(/  useEffect\(\(\) => \{[\s\S]*?  \}, \[\]\);/, newEffect);
fs.writeFileSync(p, text);
console.log("Fixed AuthContext");
