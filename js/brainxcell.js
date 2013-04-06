/**
 * brainxcell DSL
 * author: K. Golbang
 *
 * brainxcell is an easy way to build mainmaps using a javascript DSL.
 */
var brainxcell = (function($) {

    function Utils() {};
    Utils.extends = function(parent,child) {
        child.prototype = new parent();
        child.prototype.constructor = child;
        return child;
    }

    function Configurable(cfg) {
        this.init = function(cfg){
            if(!cfg) return;
            for(var key in cfg) {
                this[key] = cfg[key];
            }
        }
        this.init(cfg);
    }

    function Renderable() {

    }

    function Node(cfg) {
        this.id = 'nameless';
        this.desc = 'TODO: description';
        this.init(cfg);
    }

    function Branch(cfg) {
        this.children = [];
        this.branch = function(cfg) {
            for(var i=0;i<this.children.length;i++) {
                var ch = this.children[i];
                if(ch.id === cfg.id)
                    return ch;
            }
            var b = new Branch(cfg);
            this.children.push(b);
            return b;
        }
        this.init(cfg);
    }

    function Root(cfg) {
        this.init(cfg);
    }

    Utils.extends(Configurable,Node);
    Utils.extends(Node,Branch);
    Utils.extends(Branch,Root);

    return {
        createRoot : function(cfg) {
            if(!this.root)
                this.root = new Root(cfg);
            return this.root;
        },
        root : null
    };

})(jQuery);


function root(cfg) {
    var b = brainxcell;
    if(!b)
        return null;
    return b.createRoot(cfg);
}

/*
root({desc : 'root'}).branch('branch_0').branch('branch_0_0').branch('branch_0_1').leaf();
root().branch('branch_0').branch('branch_1_0').branch('branch_1_1').leaf();
root().branch('branch_1').branch('branch_1_0').branch('branch_1_1').leaf();
*/

/*
//alternative:
root( 'root', function() {
    branch( 'name', function() {
        branch( 'name', function() {
            branch( 'name', function() {
                leaf();
                leaf();
                leaf();

            })
        })
    })
});*/