/* Minimal TeX renderer — just the subset the case studies actually use.

   MathJax and KaTeX are both a CDN request and a build step away from a site
   that is deliberately buildless and offline-safe, and they are ~300KB to
   typeset eight short formulas. This handles what those eight need — fractions,
   sums with limits, sub/superscripts, Greek, \text, \sqrt, delimiters — and
   nothing else. Anything unrecognised falls through as literal text rather
   than breaking, so an unsupported macro degrades to readable source.

   Exposes window.renderTex(texString) -> HTML string.

   ponytail: hand-rolled subset, swap for KaTeX if the notation ever needs
   matrices, integrals or alignment. */
(function () {
  'use strict';

  var SYM = {
    alpha:'α', beta:'β', gamma:'γ', delta:'δ', epsilon:'ε',
    zeta:'ζ', eta:'η', theta:'θ', iota:'ι', kappa:'κ',
    lambda:'λ', mu:'μ', nu:'ν', xi:'ξ', pi:'π', rho:'ρ',
    sigma:'σ', tau:'τ', upsilon:'υ', phi:'φ', chi:'χ',
    psi:'ψ', omega:'ω',
    Gamma:'Γ', Delta:'Δ', Theta:'Θ', Lambda:'Λ', Xi:'Ξ',
    Pi:'Π', Sigma:'Σ', Phi:'Φ', Psi:'Ψ', Omega:'Ω',
    times:'×', cdot:'·', div:'÷', pm:'±', mp:'∓',
    leq:'≤', geq:'≥', neq:'≠', approx:'≈', equiv:'≡',
    to:'→', rightarrow:'→', leftarrow:'←', Rightarrow:'⇒',
    in:'∈', notin:'∉', subset:'⊂', forall:'∀', exists:'∃',
    infty:'∞', partial:'∂', nabla:'∇', sum:'∑', prod:'∏',
    int:'∫', sqrt:'√', angle:'∠', propto:'∝',
    ldots:'…', cdots:'⋯', quad:' ', qquad:'  ',
    lVert:'‖', rVert:'‖', lfloor:'⌊', rfloor:'⌋'
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Read one argument: a {...} group, a \macro, or a single character. */
  function arg(src, i) {
    while (src[i] === ' ') i++;
    if (src[i] === '{') {
      var depth = 1, j = i + 1;
      while (j < src.length && depth > 0) {
        if (src[j] === '{') depth++;
        else if (src[j] === '}') depth--;
        if (depth > 0) j++;
      }
      return { body: src.slice(i + 1, j), next: j + 1 };
    }
    if (src[i] === '\\') {
      var m = /^\\([a-zA-Z]+)/.exec(src.slice(i));
      if (m) return { body: m[0], next: i + m[0].length };
    }
    return { body: src[i] || '', next: i + 1 };
  }

  function walk(src) {
    var out = '', i = 0;

    while (i < src.length) {
      var ch = src[i];

      if (ch === '\\') {
        var m = /^\\([a-zA-Z]+)|^\\(.)/.exec(src.slice(i));
        var name = m && (m[1] || m[2]);

        if (name === 'frac' || name === 'tfrac' || name === 'dfrac') {
          var n = arg(src, i + 1 + name.length);
          var d = arg(src, n.next);
          out += '<span class="tex-frac"><span class="tex-num">' + walk(n.body) +
                 '</span><span class="tex-den">' + walk(d.body) + '</span></span>';
          i = d.next; continue;
        }
        if (name === 'sqrt') {
          var a = arg(src, i + 5);
          out += '<span class="tex-sqrt">√<span class="tex-rad">' + walk(a.body) + '</span></span>';
          i = a.next; continue;
        }
        if (name === 'text' || name === 'mathrm' || name === 'operatorname') {
          var t = arg(src, i + 1 + name.length);
          out += '<span class="tex-text">' + esc(t.body) + '</span>';
          i = t.next; continue;
        }
        if (name === 'mathcal' || name === 'mathbb' || name === 'mathbf') {
          var g = arg(src, i + 1 + name.length);
          out += '<span class="tex-' + name + '">' + walk(g.body) + '</span>';
          i = g.next; continue;
        }
        if (name === 'left' || name === 'right') {           // sizing hints: drop
          i += 1 + name.length; continue;
        }
        if (name === 'big' || name === 'Big' || name === 'bigg' || name === 'Bigg') {
          i += 1 + name.length; continue;
        }
        if (name === 'arg') {                                 // \arg\max
          out += '<span class="tex-op">arg</span>'; i += 4; continue;
        }
        if (name === 'max' || name === 'min' || name === 'log' || name === 'exp' ||
            name === 'sin' || name === 'cos' || name === 'tan' || name === 'lim') {
          out += '<span class="tex-op">' + name + '</span>'; i += 1 + name.length; continue;
        }
        if (name === ';' || name === ',' || name === ':' || name === '!' || name === ' ') {
          out += name === '!' ? '' : '<span class="tex-sp"></span>'; i += 2; continue;
        }
        if (name === 'hat' || name === 'bar' || name === 'vec' || name === 'tilde') {
          var h = arg(src, i + 1 + name.length);
          var acc = { hat:'̂', bar:'̄', vec:'⃗', tilde:'̃' }[name];
          out += '<span class="tex-acc">' + walk(h.body) + acc + '</span>';
          i = h.next; continue;
        }
        if (SYM[name] != null) {
          var cls = (name === 'sum' || name === 'prod' || name === 'int') ? ' class="tex-bigop"' : '';
          out += '<span' + cls + '>' + SYM[name] + '</span>';
          i += 1 + name.length; continue;
        }
        // unknown macro: emit the name so it stays readable
        out += esc(name || ''); i += m ? m[0].length : 1; continue;
      }

      if (ch === '^' || ch === '_') {
        var s = arg(src, i + 1);
        // A sum/prod immediately before takes limits under/over rather than
        // as a script, which is what makes \sum_{f} read correctly.
        var isBig = /class="tex-bigop"[^<]*>[∑∏∫]<\/span>$/.test(out);
        if (isBig && ch === '_') {
          out = out.replace(/(<span class="tex-bigop">[\s\S]*?<\/span>)$/,
            '<span class="tex-limits">$1<span class="tex-under">' + walk(s.body) + '</span></span>');
        } else {
          out += '<' + (ch === '^' ? 'sup' : 'sub') + '>' + walk(s.body) + '</' +
                 (ch === '^' ? 'sup' : 'sub') + '>';
        }
        i = s.next; continue;
      }

      if (ch === '{' || ch === '}') { i++; continue; }
      out += esc(ch);
      i++;
    }
    return out;
  }

  window.renderTex = function (tex) {
    try { return walk(String(tex)); }
    catch (e) { return esc(tex); }   // never let a bad formula break the page
  };
})();
